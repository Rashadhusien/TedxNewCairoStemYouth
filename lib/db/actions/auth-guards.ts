"use server";

import { eq } from "drizzle-orm";
import type { Session } from "next-auth";

import { auth } from "@/auth";
import { isAdminRole } from "@/lib/auth/route-guards";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ForbiddenError, UnauthorizedError } from "@/lib/http-errors";

export type AuthenticatedUser = {
  id: string;
  role: string;
  isActive: boolean;
};

async function getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export async function assertUserIsActive(
  userId: string,
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(userId);

  if (!user.isActive) {
    throw new ForbiddenError("Account is deactivated. Contact support.");
  }

  return user;
}

export async function requireActiveSession(): Promise<{
  session: Session;
  user: AuthenticatedUser;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const user = await assertUserIsActive(session.user.id);
  return { session, user };
}

export async function requireAdminSession(): Promise<{
  session: Session;
  user: AuthenticatedUser;
}> {
  const context = await requireActiveSession();

  if (!isAdminRole(context.user.role)) {
    throw new ForbiddenError("Admin access required");
  }

  return context;
}
