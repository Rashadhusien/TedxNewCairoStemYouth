"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { accounts, tickets, users } from "@/lib/db/schema";
import { auth } from "@/auth";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { UpdateProfileSchema } from "@/lib/validation";
import type { ErrorResponse } from "@/types/actions";
import { ROUTES } from "@/constants/routes";
import type { Ticket } from "@/lib/db/schema";

// ── Types ────────────────────────────────────────────────────────────────────

export type ProfileData = {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  university: string | null;
  major: string | null;
  graduationYear: number | null;
  age: number | null;
  skills: string[] | null;
  image: string | null;
  isCredentialsUser: boolean;
  ticket: {
    id: string;
    type: string;
    qrCode: string | null;
    status: Ticket["status"];
    pricePaid: number;
    createdAt: Date;
  } | null;
};

export type UpdateProfileSuccessResponse = {
  success: true;
  message: string;
};

export type UpdateProfileResponse =
  | UpdateProfileSuccessResponse
  | ErrorResponse;

// ── getProfile ───────────────────────────────────────────────────────────────

export async function getProfile(): Promise<ProfileData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      university: users.university,
      major: users.major,
      graduationYear: users.graduationYear,
      age: users.age,
      skills: users.skills,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  // Check if this is a credentials account (to conditionally show password section)
  const [credentialsAccount] = await db
    .select({ provider: accounts.provider })
    .from(accounts)
    .where(
      and(eq(accounts.userId, userId), eq(accounts.provider, "credentials")),
    )
    .limit(1);

  // Fetch ticket (users have at most one ticket)
  const [ticket] = await db
    .select({
      id: tickets.id,
      type: tickets.type,
      qrCode: tickets.qrCode,
      status: tickets.status,
      pricePaid: tickets.pricePaid,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .where(eq(tickets.userId, userId))
    .limit(1);

  return {
    ...user,
    isCredentialsUser: !!credentialsAccount,
    ticket: ticket ?? null,
  };
}

// ── updateProfile ────────────────────────────────────────────────────────────

export async function updateProfile(params: {
  fullName: string;
  phone: string | null;
  university: string | null;
  major: string | null;
  graduationYear: number | null;
  age: number | null;
  skills: string[];
}): Promise<UpdateProfileResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { message: "You must be signed in to update your profile." },
    };
  }

  const validationResult = await action({
    params,
    schema: UpdateProfileSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { fullName, phone, university, major, graduationYear, age, skills } =
    validationResult.params!;

  try {
    await db
      .update(users)
      .set({
        fullName,
        name: fullName, // keep name in sync for NextAuth adapter
        phone: phone ?? null,
        university: university ?? null,
        major: major ?? null,
        graduationYear: graduationYear ?? null,
        age: age ?? null,
        skills: skills.length > 0 ? skills : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath(ROUTES.PROFILE);

    return { success: true, message: "Profile updated." };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
