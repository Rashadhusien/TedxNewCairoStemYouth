"use server";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";

import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { ForbiddenError, NotFoundError } from "@/lib/http-errors";
import {
  UpdateUserActiveSchema,
  UserListSchema,
} from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import { ROUTES } from "@/constants/routes";

import { db } from "..";
import { users } from "../schema";
import { requireAdminSession } from "./auth-guards";

type UserListInput = z.infer<typeof UserListSchema>;
type UpdateUserActiveInput = z.infer<typeof UpdateUserActiveSchema>;

export type AdminUserListItem = {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  phone: string | null;
  role: "attendee" | "organizer" | "admin" | "sponsor";
  university: string | null;
  emailVerified: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function listUsers(params: UserListInput): Promise<
  | ActionResponse<{
      items: AdminUserListItem[];
      total: number;
      page: number;
      pageSize: number;
    }>
  | ErrorResponse
> {
  const validationResult = await action<UserListInput>({
    params,
    schema: UserListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();

    const { status, search, page, pageSize } =
      validationResult.params as UserListInput;

    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(users.isActive, status === "active"));
    }

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(users.fullName, term),
          ilike(users.name, term),
          ilike(users.email, term),
          ilike(users.phone, term),
          ilike(users.role, term),
          ilike(users.university, term),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        university: users.university,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(users.createdAt));

    return {
      success: true,
      data: { items: rows, total: countRow?.count ?? 0, page, pageSize },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateUserActiveStatus(
  params: UpdateUserActiveInput,
): Promise<ActionResponse<{ id: string; isActive: boolean }> | ErrorResponse> {
  const validationResult = await action<UpdateUserActiveInput>({
    params,
    schema: UpdateUserActiveSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { user: currentUser } = await requireAdminSession();
    const { userId, isActive } = validationResult.params as UpdateUserActiveInput;

    const [targetUser] = await db
      .select({
        id: users.id,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return handleError(new NotFoundError("User")) as ErrorResponse;
    }

    if (currentUser.id === targetUser.id && !isActive) {
      return handleError(
        new ForbiddenError("You cannot deactivate your own account."),
      ) as ErrorResponse;
    }

    const isPrivilegedUser =
      targetUser.role === "admin" || targetUser.role === "organizer";

    if (isPrivilegedUser && targetUser.isActive && !isActive) {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(
          and(
            eq(users.isActive, true),
            or(eq(users.role, "admin"), eq(users.role, "organizer")),
          ),
        );

      if ((countRow?.count ?? 0) <= 1) {
        return handleError(
          new ForbiddenError(
            "You cannot deactivate the last active admin or organizer.",
          ),
        ) as ErrorResponse;
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        isActive: users.isActive,
      });

    if (!updatedUser) {
      return handleError(new NotFoundError("User")) as ErrorResponse;
    }

    revalidatePath(ROUTES.ADMIN.USERS);

    return {
      success: true,
      data: {
        id: updatedUser.id,
        isActive: updatedUser.isActive,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
