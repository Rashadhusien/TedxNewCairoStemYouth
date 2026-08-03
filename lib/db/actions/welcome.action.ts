"use server";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import handleError from "@/lib/handlers/error";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import { requireActiveSession } from "./auth-guards";

// ── Types ────────────────────────────────────────────────────────────────────

export type WelcomeStatusData = {
  shouldShow: boolean;
  fullName: string | null;
};

export type WelcomeStatusResponse =
  | ActionResponse<WelcomeStatusData>
  | ErrorResponse;

export type MarkWelcomeSeenResponse =
  | ActionResponse<{ id: string }>
  | ErrorResponse;

// ── getWelcomeStatus ───────────────────────────────────────────────────────────

export async function getWelcomeStatus(): Promise<WelcomeStatusResponse> {
  try {
    const { session } = await requireActiveSession();

    const [user] = await db
      .select({
        hasSeenWelcome: users.hasSeenWelcome,
        fullName: users.fullName,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: {
          message: "User not found",
        },
      };
    }

    return {
      success: true,
      data: {
        shouldShow: !user.hasSeenWelcome,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// ── markWelcomeSeen ───────────────────────────────────────────────────────────

export async function markWelcomeSeen(): Promise<MarkWelcomeSeenResponse> {
  try {
    const { session } = await requireActiveSession();

    // Atomic conditional update: only update if not already seen
    const [updatedUser] = await db
      .update(users)
      .set({
        hasSeenWelcome: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({ id: users.id });

    // Idempotent: return success even if no row was updated (already seen)
    if (!updatedUser) {
      return {
        success: true,
        data: { id: session.user.id },
      };
    }

    return {
      success: true,
      data: { id: updatedUser.id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
