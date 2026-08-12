"use server";

import { and, eq, ilike, isNull, or, sql } from "drizzle-orm";

import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { SpeakerListSchema, speakerFormSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type z from "zod";
import { db } from "..";
import { speakers } from "../schema";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { requireAdminSession } from "./auth-guards";
import { actorFromSession, createAuditLog } from "@/lib/db/audit";

type SpeakerInput = z.infer<typeof speakerFormSchema>;
type SpeakerListInput = z.infer<typeof SpeakerListSchema>;

export async function createSpeaker(
  params: SpeakerInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const validationResult = await action<SpeakerInput>({
    params,
    schema: speakerFormSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { session } = await requireAdminSession();
    const data = validationResult.params;

    if (!data) {
      return handleError(new Error("Invalid params")) as ErrorResponse;
    }

    const [created] = await db
      .insert(speakers)
      .values({
        ...data,
        createdBy: session.user.id,
        updatedAt: new Date(),
      })
      .returning({ id: speakers.id });

    revalidatePath(ROUTES.HOME);
    revalidatePath("/admin/speakers");

    void createAuditLog({
      category: "admin",
      action: "speaker.create",
      ...actorFromSession(session),
      entityType: "speaker",
      entityId: created.id,
      summary: `Created speaker "${data.name}"`,
      metadata: { type: data.type },
    });

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error(error);
    return handleError(error) as ErrorResponse;
  }
}

export async function listSpeakers(params: SpeakerListInput): Promise<
  | ActionResponse<{
      items: (typeof speakers.$inferSelect)[];
      total: number;
      page: number;
      pageSize: number;
    }>
  | ErrorResponse
> {
  const validationResult = await action<SpeakerListInput>({
    params,
    schema: SpeakerListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();
    const { type, status, search, page, pageSize } =
      validationResult.params as SpeakerListInput;

    const conditions = [isNull(speakers.deletedAt)];

    if (type !== "all") {
      conditions.push(eq(speakers.type, type));
    }

    if (status !== "all") {
      conditions.push(eq(speakers.isActive, status === "active"));
    }

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(speakers.name, term),
          ilike(speakers.role, term),
          ilike(speakers.description, term),
        )!,
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(speakers)
      .where(whereClause);

    const rows = await db
      .select()
      .from(speakers)
      .where(whereClause)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(speakers.displayOrder, speakers.createdAt);

    return {
      success: true,
      data: { items: rows, total: countRow?.count ?? 0, page, pageSize },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSpeakerById(
  speakerId: string,
): Promise<ActionResponse<typeof speakers.$inferSelect | null>> {
  try {
    await requireAdminSession();

    const [speaker] = await db
      .select()
      .from(speakers)
      .where(and(eq(speakers.id, speakerId), isNull(speakers.deletedAt)))
      .limit(1);

    if (!speaker) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: speaker,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateSpeaker(
  params: {
    id: string;
  } & SpeakerInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const { id, ...rest } = params;

  const validationResult = await action<SpeakerInput>({
    params: rest,
    schema: speakerFormSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { session } = await requireAdminSession();

    const data = validationResult.params as SpeakerInput;

    const [update] = await db
      .update(speakers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(speakers.id, id), isNull(speakers.deletedAt)))
      .returning({ id: speakers.id });

    if (!update) {
      return handleError(new NotFoundError("Speaker")) as ErrorResponse;
    }

    revalidatePath(ROUTES.HOME);
    revalidatePath("/admin/speakers");

    void createAuditLog({
      category: "admin",
      action: "speaker.update",
      ...actorFromSession(session),
      entityType: "speaker",
      entityId: update.id,
      summary: `Updated speaker "${data.name}"`,
      metadata: { type: data.type },
    });

    return { success: true, data: { id: update.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteSpeaker(
  id: string,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  try {
    const { session } = await requireAdminSession();

    const [updated] = await db
      .update(speakers)
      .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
      .where(and(eq(speakers.id, id), isNull(speakers.deletedAt)))
      .returning({ id: speakers.id });

    if (!updated) {
      return handleError(new NotFoundError("Speaker")) as ErrorResponse;
    }

    revalidatePath(ROUTES.HOME);
    revalidatePath("/admin/speakers");

    void createAuditLog({
      category: "admin",
      action: "speaker.delete",
      ...actorFromSession(session),
      entityType: "speaker",
      entityId: updated.id,
      summary: `Deleted speaker ${updated.id}`,
    });

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// Public function to fetch active speakers for the frontend
export async function getAllSpeakers({
  type,
}: {
  type: "main" | "keyholder" | "all";
}): Promise<
  | ActionResponse<{
      items: (typeof speakers.$inferSelect)[];
      total: number;
    }>
  | ErrorResponse
> {
  try {
    const conditions = [
      eq(speakers.isActive, true),
      isNull(speakers.deletedAt),
    ];

    if (type !== "all") {
      conditions.push(eq(speakers.type, type));
    }

    const whereClause = and(...conditions);
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(speakers)
      .where(whereClause);

    const rows = await db
      .select()
      .from(speakers)
      .where(whereClause)
      .orderBy(speakers.displayOrder, speakers.createdAt);

    return {
      success: true,
      data: { items: rows, total: countRow?.count ?? 0 },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
