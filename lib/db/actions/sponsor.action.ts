"use server";

import { auth } from "@/auth";
import { isAdminRole } from "@/lib/auth/route-guards";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { ForbiddenError, NotFoundError } from "@/lib/http-errors";
import { sponsorFormSchema, SponsorListSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type z from "zod";
import { db } from "..";
import { sponsors } from "../schema";
import {
  ActiveSponsorLeadQuestions,
  SponsorsWithRelations,
} from "@/types/sponsor";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";

type SponsorInput = z.infer<typeof sponsorFormSchema>;
type SponsorListInput = z.infer<typeof SponsorListSchema>;
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

export async function createSponsor(
  params: SponsorInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const validationResult = await action<SponsorInput>({
    params,
    schema: sponsorFormSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const session = await requireAdmin();
    const data = validationResult.params;

    if (!data) {
      return handleError(new Error("Invalid params")) as ErrorResponse;
    }

    const [created] = await db
      .insert(sponsors)
      .values({
        ...data,
        createdBy: session.user.id,
        updatedAt: new Date(),
      })
      .returning({ id: sponsors.id });

    revalidatePath(ROUTES.HOME);
    revalidatePath(ROUTES.ADMIN.SPONSORS.HOME);

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error(error);
    return handleError(error) as ErrorResponse;
  }
}

export async function listSponsors(params: SponsorListInput): Promise<
  | ActionResponse<{
      items: SponsorsWithRelations[];
      total: number;
      page: number;
      pageSize: number;
    }>
  | ErrorResponse
> {
  const validationResult = await action<SponsorListInput>({
    params,
    schema: SponsorListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdmin();
    const { status, search, page, pageSize } =
      validationResult.params as SponsorListInput;

    const conditions = [];
    if (status !== "all") {
      conditions.push(eq(sponsors.isActive, status === "active"));
    }
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(ilike(sponsors.name, term), ilike(sponsors.description, term)),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sponsors)
      .where(whereClause);

    const rows = await db
      .select()
      .from(sponsors)
      .where(whereClause)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(sponsors.updatedAt));

    return {
      success: true,
      data: { items: rows, total: countRow?.count ?? 0, page, pageSize },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSponsorById(
  sponsorId: string,
): Promise<ActionResponse<SponsorsWithRelations | null>> {
  try {
    await requireAdmin();

    const [sponsor] = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.id, sponsorId))
      .limit(1);

    if (!sponsor) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: sponsor,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateSponsor(
  params: {
    id: string;
  } & SponsorInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const { id, ...rest } = params;

  const validationResult = await action<SponsorInput>({
    params: rest,
    schema: sponsorFormSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdmin();

    const data = validationResult.params as SponsorInput;

    const [update] = await db
      .update(sponsors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sponsors.id, id))
      .returning({ id: sponsors.id });

    if (!update) {
      return handleError(new NotFoundError("Sponsor")) as ErrorResponse;
    }

    return { success: true, data: { id: update.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// public
export async function getAllSponsors({
  type,
}: {
  type: "sponsor" | "partner";
}): Promise<
  | ActionResponse<{
      items: SponsorsWithRelations[];
      total: number;
    }>
  | ErrorResponse
> {
  try {
    const conditions = [eq(sponsors.isActive, true)];

    if (type) {
      conditions.push(eq(sponsors.type, type));
    }

    const whereClause = and(...conditions);
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sponsors)
      .where(whereClause);

    const rows = await db
      .select()
      .from(sponsors)
      .where(whereClause)
      .orderBy(sponsors.displayOrder, sponsors.name);

    return {
      success: true,
      data: { items: rows, total: countRow?.count ?? 0 },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
