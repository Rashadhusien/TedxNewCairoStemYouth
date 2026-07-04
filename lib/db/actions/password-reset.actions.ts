// lib/db/actions/password-reset.actions.ts
// Follows the exact same pattern as auth.actions.ts

"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { addMinutes } from "date-fns";

import { db } from "@/lib/db";
import { accounts, passwordResetTokens, users } from "@/lib/db/schema";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  RESET_TOKEN_TTL_MINUTES,
} from "@/lib/auth/password-reset";
import { normalizeAuthEmail } from "@/lib/auth/verification";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/validation";
import { getClientIp } from "@/lib/get-ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email/password-reset-email";
import type { ErrorResponse } from "@/types/actions";
import { serverAnalytics } from "@/lib/analytics/server";

const BCRYPT_ROUNDS = 12;

// ── Response types (same pattern as auth.actions.ts) ────────────────────────

export type ForgotPasswordSuccessResponse = {
  success: true;
  message: string;
};

export type ForgotPasswordResponse =
  | ForgotPasswordSuccessResponse
  | ErrorResponse;

export type ResetPasswordSuccessResponse = {
  success: true;
  message: string;
};

export type ResetPasswordResponse =
  | ResetPasswordSuccessResponse
  | ErrorResponse;

// ── Forgot Password Action ───────────────────────────────────────────────────

/**
 * Step 1: User submits their email.
 * Always returns the same success message regardless of whether
 * the email exists — prevents email enumeration attacks.
 */
export const forgotPassword = async (params: {
  email: string;
}): Promise<ForgotPasswordResponse> => {
  const validationResult = await action({
    params,
    schema: ForgotPasswordSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const ip = await getClientIp();
  const rl = await checkRateLimit("forgot-password", ip);

  if (!rl.success) {
    return {
      success: false,
      error: {
        message: `Too many requests. Please try again in ${rl.retryAfterSeconds} seconds.`,
      },
    } as ErrorResponse;
  }

  // Generic message — always returned regardless of whether email exists
  const genericResponse: ForgotPasswordSuccessResponse = {
    success: true,
    message:
      "If that email is registered, you'll receive a reset link within a few minutes.",
  };

  const { email } = validationResult.params!;
  const normalizedEmail = normalizeAuthEmail(email);

  try {
    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Return generic response if user not found — don't reveal existence
    if (!user || !user.isActive || !user.emailVerified) {
      return genericResponse;
    }

    // Invalidate any existing unused tokens for this user
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt),
        ),
      );

    // Generate new token
    const { raw, hash } = generatePasswordResetToken();
    const expiresAt = addMinutes(new Date(), RESET_TOKEN_TTL_MINUTES);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hash,
      expiresAt,
    });

    // Send email (fire — if it fails, user can try again; don't expose error)
    const displayName = user.fullName ?? user.name ?? "there";
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${raw}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: displayName,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      idempotencyKey: `password-reset-${user.id}-${Date.now()}`,
    });

    serverAnalytics.capture("password_reset_requested", user.id, {});

    return genericResponse;
  } catch (error) {
    // Log but return generic success — don't expose internal errors
    console.error("[forgotPassword] Error:", error);
    return genericResponse;
  }
};

// ── Reset Password Action ────────────────────────────────────────────────────

/**
 * Step 2: User submits the new password with the token from the email link.
 * Token is single-use and expires after RESET_TOKEN_TTL_MINUTES.
 */
export const resetPassword = async (params: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ResetPasswordResponse> => {
  const validationResult = await action({
    params,
    schema: ResetPasswordSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const ip = await getClientIp();
  const rl = await checkRateLimit("reset-password", ip);

  if (!rl.success) {
    return {
      success: false,
      error: {
        message: `Too many attempts. Please try again in ${rl.retryAfterSeconds} seconds.`,
      },
    } as ErrorResponse;
  }

  const { token: rawToken, password } = validationResult.params!;
  const tokenHash = hashPasswordResetToken(rawToken);

  try {
    // Find a valid, unused, non-expired token
    const [tokenRecord] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      return {
        success: false,
        error: {
          message:
            "This reset link is invalid or has expired. Please request a new one.",
        },
      };
    }

    const newPasswordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Neon HTTP driver does not support transactions.
    // Order is intentional: consume the token FIRST so that even if the
    // password updates below fail, the link cannot be replayed.
    // A failed password update leaves the user's old password intact —
    // they can simply request a new reset link.
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenRecord.userId));

    await db
      .update(accounts)
      .set({ password: newPasswordHash })
      .where(
        and(
          eq(accounts.userId, tokenRecord.userId),
          eq(accounts.provider, "credentials"),
        ),
      );

    serverAnalytics.capture("password_reset_completed", tokenRecord.userId, {});

    return {
      success: true,
      message: "Password updated. You can now sign in with your new password.",
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

// ── Token Validation (used by reset page to pre-validate before render) ─────

export type ValidateResetTokenResponse =
  | { valid: true }
  | { valid: false; reason: string };

export const validateResetToken = async (
  rawToken: string,
): Promise<ValidateResetTokenResponse> => {
  if (!rawToken) return { valid: false, reason: "No token provided." };

  const tokenHash = hashPasswordResetToken(rawToken);

  try {
    const [tokenRecord] = await db
      .select({ id: passwordResetTokens.id })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      return {
        valid: false,
        reason: "This reset link is invalid or has expired.",
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      reason: "Unable to verify token. Please try again.",
    };
  }
};
