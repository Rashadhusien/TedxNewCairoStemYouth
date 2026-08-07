"use server";

import { and, eq, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { accounts, tickets, users, orders } from "@/lib/db/schema";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { UpdateProfileSchema } from "@/lib/validation";
import type { ErrorResponse } from "@/types/actions";
import { ROUTES } from "@/constants/routes";
import type { Ticket } from "@/lib/db/schema";
import { requireActiveSession } from "./auth-guards";

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
  // Legacy single ticket (for backward compatibility)
  ticket: {
    id: string;
    type: string;
    qrCode: string | null;
    status: Ticket["status"];
    pricePaid: number;
    createdAt: Date;
  } | null;
  // New order system
  orders: Array<{
    id: string;
    status: string;
    packageName: string;
    packageTicketCount: number;
    finalAmountPiastres: number;
    paidAt: Date | null;
    createdAt: Date;
    tickets: Array<{
      id: string;
      type: string;
      qrCode: string | null;
      status: Ticket["status"];
      pricePaid: number;
      attendeeName: string | null;
      attendeeEmail: string | null;
      attendeePhone: string | null;
    }>;
  }>;
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
  try {
    const { session } = await requireActiveSession();

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

    const [credentialsAccount] = await db
      .select({ provider: accounts.provider })
      .from(accounts)
      .where(
        and(eq(accounts.userId, userId), eq(accounts.provider, "credentials")),
      )
      .limit(1);

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
      .where(and(eq(tickets.userId, userId), isNull(tickets.orderId))) // Only legacy tickets
      .limit(1);

    // Fetch orders with their tickets
    const userOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        packageName: orders.packageName,
        packageTicketCount: orders.packageTicketCount,
        finalAmountPiastres: orders.finalAmountPiastres,
        paidAt: orders.paidAt,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    // Fetch tickets for each order
    const ordersWithTickets = await Promise.all(
      userOrders.map(async (order) => {
        const orderTickets = await db
          .select({
            id: tickets.id,
            type: tickets.type,
            qrCode: tickets.qrCode,
            status: tickets.status,
            pricePaid: tickets.pricePaid,
            attendeeName: tickets.attendeeName,
            attendeeEmail: tickets.attendeeEmail,
            attendeePhone: tickets.attendeePhone,
          })
          .from(tickets)
          .where(eq(tickets.orderId, order.id));

        return {
          ...order,
          tickets: orderTickets,
        };
      }),
    );

    return {
      ...user,
      isCredentialsUser: !!credentialsAccount,
      ticket: ticket ?? null,
      orders: ordersWithTickets,
    };
  } catch {
    return null;
  }
}

// ── updateProfile ────────────────────────────────────────────────────────────

export async function updateProfile(params: {
  fullName: string;
  image?: string | null;
  phone: string | null;
  university: string | null;
  major: string | null;
  graduationYear: number | null;
  age: number | null;
  skills: string[];
}): Promise<UpdateProfileResponse> {
  const validationResult = await action({
    params,
    schema: UpdateProfileSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    fullName,
    image,
    phone,
    university,
    major,
    graduationYear,
    age,
    skills,
  } = validationResult.params!;

  try {
    const { session } = await requireActiveSession();

    await db
      .update(users)
      .set({
        fullName,
        name: fullName, // keep name in sync for NextAuth adapter
        image: image ?? null,
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
