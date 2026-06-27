"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/auth";
import {
  clearVerificationOtp,
  createAndSendVerificationOtp,
  getUserByEmail,
  normalizeAuthEmail,
  verifyOtpForEmail,
} from "@/lib/auth/verification";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import {
  AdminLoginFormSchema,
  ResendVerificationSchema,
  UserLoginFormSchema,
  UserRegisterFormSchema,
  VerifyEmailActionSchema,
} from "@/lib/validation";
import {
  AdminSignInCredentials,
  AuthCredentails,
  ErrorResponse,
  SignInCredentials,
} from "@/types/actions";
import { ADMIN_ACCESS_ROLES } from "@/lib/auth/route-guards";

import { db } from "..";
import { accounts, users } from "../schema";
import { ROUTES } from "@/constants/routes";
import { getClientIp } from "@/lib/get-ip";
import { checkRateLimit } from "@/lib/rate-limit";

const CREDENTIALS_PROVIDER = "credentials";
const BCRYPT_ROUNDS = 12;

export type RegisterSuccessResponse = {
  success: true;
  email: string;
};

export type RegisterResponse = RegisterSuccessResponse | ErrorResponse;

export type VerifyEmailSuccessResponse = {
  success: true;
  signedIn: boolean;
};

export type VerifyEmailResponse = VerifyEmailSuccessResponse | ErrorResponse;

export type ResendVerificationSuccessResponse = {
  success: true;
};

export type ResendVerificationResponse =
  | ResendVerificationSuccessResponse
  | ErrorResponse;

export type SignInSuccessResponse = {
  success: true;
};

export type SignInErrorResponse = ErrorResponse & {
  requiresVerification?: boolean;
  email?: string;
};

export type SignInResponse = SignInSuccessResponse | SignInErrorResponse;

const UNVERIFIED_EMAIL_MESSAGE =
  "Please verify your email. Check your inbox for the verification code.";

function parseSignInRedirectUrl(redirectUrl: string): SignInResponse {
  const base =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const url = redirectUrl.startsWith("http")
    ? new URL(redirectUrl)
    : new URL(redirectUrl, base);

  const error = url.searchParams.get("error");
  if (!error) {
    return { success: true };
  }

  const message =
    error === "CredentialsSignin"
      ? "Invalid email or password"
      : error === "AccessDenied"
        ? "Access denied"
        : "Sign in failed. Please try again.";

  return {
    success: false,
    error: { message },
  };
}

export const signInWithCredentials = async (
  params: SignInCredentials,
): Promise<SignInResponse> => {
  const validationResult = await action({
    params,
    schema: UserLoginFormSchema,
  });

  const ip = await getClientIp();

  // Check both vectors in parallel
  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit("login", ip),
    checkRateLimit("login", `email:${params.email}`),
  ]);

  if (!ipLimit.success || !emailLimit.success) {
    const retryAfter = Math.max(
      ipLimit.success ? 0 : ipLimit.retryAfterSeconds,
      emailLimit.success ? 0 : emailLimit.retryAfterSeconds,
    );
    return {
      success: false,
      error: {
        message: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
      },
    };
  }

  if (validationResult instanceof Error) {
    return handleError(validationResult) as SignInErrorResponse;
  }

  const { email, password } = validationResult.params!;
  const normalizedEmail = normalizeAuthEmail(email);

  try {
    const user = await getUserByEmail(normalizedEmail);

    if (user && !user.emailVerified) {
      return {
        success: false,
        error: { message: UNVERIFIED_EMAIL_MESSAGE },
        requiresVerification: true,
        email: normalizedEmail,
      };
    }

    const redirectUrl = await signIn(CREDENTIALS_PROVIDER, {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    if (typeof redirectUrl !== "string") {
      return handleError(
        new Error("Unexpected sign-in response"),
      ) as SignInErrorResponse;
    }

    const result = parseSignInRedirectUrl(redirectUrl);

    if (
      !result.success &&
      result.error.message === "Invalid email or password" &&
      user &&
      !user.emailVerified
    ) {
      return {
        success: false,
        error: { message: UNVERIFIED_EMAIL_MESSAGE },
        requiresVerification: true,
        email: normalizedEmail,
      };
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("verify your email")) {
        return {
          success: false,
          error: { message: UNVERIFIED_EMAIL_MESSAGE },
          requiresVerification: true,
          email: normalizedEmail,
        };
      }

      return {
        success: false,
        error: {
          message:
            error.message === "Invalid email or password"
              ? error.message
              : "Sign in failed. Please try again.",
        },
      };
    }

    return handleError(error) as SignInErrorResponse;
  }
};

export const signInAdminWithCredentials = async (
  params: AdminSignInCredentials,
): Promise<SignInResponse> => {
  const validationResult = await action({
    params,
    schema: AdminLoginFormSchema,
  });
  const ip = await getClientIp();

  // Check both vectors in parallel
  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit("login", ip),
    checkRateLimit("login", `email:${params.email}`),
  ]);

  if (!ipLimit.success || !emailLimit.success) {
    const retryAfter = Math.max(
      ipLimit.success ? 0 : ipLimit.retryAfterSeconds,
      emailLimit.success ? 0 : emailLimit.retryAfterSeconds,
    );
    return {
      success: false,
      error: {
        message: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
      },
    };
  }
  if (validationResult instanceof Error) {
    return handleError(validationResult) as SignInErrorResponse;
  }

  const { email, password } = validationResult.params!;
  const normalizedEmail = normalizeAuthEmail(email);

  try {
    const [user] = await db
      .select({
        emailVerified: users.emailVerified,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (user && !user.isActive) {
      return {
        success: false,
        error: { message: "Account is deactivated. Contact support." },
      };
    }

    if (user && !user.emailVerified) {
      return {
        success: false,
        error: { message: UNVERIFIED_EMAIL_MESSAGE },
      };
    }

    const redirectUrl = await signIn(CREDENTIALS_PROVIDER, {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    if (typeof redirectUrl !== "string") {
      return handleError(
        new Error("Unexpected sign-in response"),
      ) as SignInErrorResponse;
    }

    const result = parseSignInRedirectUrl(redirectUrl);
    if (!result.success) {
      return result;
    }

    const [signedInUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!signedInUser || !ADMIN_ACCESS_ROLES.has(signedInUser.role)) {
      await signOut({ redirect: false });
      return {
        success: false,
        error: {
          message: "Access denied. Admin or organizer account required.",
        },
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("verify your email")) {
        return {
          success: false,
          error: { message: UNVERIFIED_EMAIL_MESSAGE },
        };
      }

      if (error.message.includes("deactivated")) {
        return {
          success: false,
          error: { message: error.message },
        };
      }

      return {
        success: false,
        error: {
          message:
            error.message === "Invalid email or password"
              ? error.message
              : "Sign in failed. Please try again.",
        },
      };
    }

    return handleError(error) as SignInErrorResponse;
  }
};

export const registerWithCredentails = async (
  params: AuthCredentails,
): Promise<RegisterResponse> => {
  const validationResult = await action({
    params,
    schema: UserRegisterFormSchema,
  });

  const ip = await getClientIp();
  const rl = await checkRateLimit("register", ip);

  if (!rl.success) {
    return {
      success: false,
      error: {
        message: `Too many registration attempts. Please try again in ${rl.retryAfterSeconds} seconds.`,
      },
    } as ErrorResponse;
  }

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    name,
    email,
    password,
    age,
    major,
    dataConsentGiven,
    graduationYear,
    phone,
    skills,
    university,
    dataConsentAt,
  } = validationResult.params!;

  const normalizedEmail = normalizeAuthEmail(email);

  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return {
        success: false,
        error: {
          message: "An account with this email already exists",
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const consentAt = dataConsentGiven ? (dataConsentAt ?? new Date()) : null;

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        fullName: name,
        email: normalizedEmail,
        phone,
        passwordHash: hashedPassword,
        age,
        university,
        major,
        graduationYear,
        skills,
        dataConsentGiven,
        dataConsentAt: consentAt,
        role: "attendee",
        isActive: true,
      })
      .returning({ id: users.id });

    if (!newUser) {
      return handleError(
        new Error("Failed to create user account"),
      ) as ErrorResponse;
    }

    try {
      await db.insert(accounts).values({
        userId: newUser.id,
        type: "credentials",
        provider: CREDENTIALS_PROVIDER,
        providerAccountId: normalizedEmail,
        password: hashedPassword,
      });
    } catch (accountError) {
      await db.delete(users).where(eq(users.id, newUser.id));
      throw accountError;
    }

    await createAndSendVerificationOtp(normalizedEmail, name);

    return { success: true, email: normalizedEmail };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const verifyEmail = async (params: {
  email: string;
  otp: string;
  password?: string;
}): Promise<VerifyEmailResponse> => {
  const validationResult = await action({
    params,
    schema: VerifyEmailActionSchema,
  });

  const ip = await getClientIp();
  const rl = await checkRateLimit("verify-email", ip);

  if (!rl.success) {
    return {
      success: false,
      error: {
        message: `Too many verification attempts. Please try again in ${rl.retryAfterSeconds} seconds.`,
      },
    } as ErrorResponse;
  }

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, otp, password } = validationResult.params!;
  const normalizedEmail = normalizeAuthEmail(email);

  try {
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return {
        success: false,
        error: { message: "No account found for this email" },
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: { message: "Account is deactivated. Contact support." },
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: { message: "Email is already verified" },
      };
    }

    const otpValid = await verifyOtpForEmail(normalizedEmail, otp);
    if (!otpValid) {
      return {
        success: false,
        error: {
          message: "Invalid or expired verification code",
        },
      };
    }

    await db
      .update(users)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await clearVerificationOtp(normalizedEmail);

    if (password) {
      await signIn(CREDENTIALS_PROVIDER, {
        email: normalizedEmail,
        password,
        redirect: false,
      });
      return { success: true, signedIn: true };
    }

    return { success: true, signedIn: false };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const resendVerificationEmail = async (params: {
  email: string;
}): Promise<ResendVerificationResponse> => {
  const validationResult = await action({
    params,
    schema: ResendVerificationSchema,
  });
  const ip = await getClientIp();
  const rl = await checkRateLimit("resend-verification", ip);

  if (!rl.success) {
    return {
      success: false,
      error: {
        message: `Please wait ${rl.retryAfterSeconds} seconds before requesting another email.`,
      },
    } as ErrorResponse;
  }
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email } = validationResult.params!;
  const normalizedEmail = normalizeAuthEmail(email);

  try {
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return {
        success: false,
        error: { message: "No account found for this email" },
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: { message: "Account is deactivated. Contact support." },
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: { message: "Email is already verified" },
      };
    }

    await createAndSendVerificationOtp(
      normalizedEmail,
      user.fullName ?? undefined,
    );

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export async function signOutAction() {
  await signOut({ redirectTo: ROUTES.LOGIN });
}

export type GoogleSignInResponse = SignInSuccessResponse | ErrorResponse;

export async function signInWithGoogle(callbackUrl?: string): Promise<never> {
  // signIn with a provider never returns — it throws a NEXT_REDIRECT.
  // The return type is `never` to make that explicit to callers.
  const redirectTo = callbackUrl ?? ROUTES.HOME;
  await signIn("google", { redirectTo });

  // Unreachable — TypeScript needs this to satisfy the return type
  throw new Error("unreachable");
}
