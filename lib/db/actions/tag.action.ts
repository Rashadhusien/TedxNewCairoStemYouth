"use server";

import { asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { TagCreateSchema, TagUpdateSchema } from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

import { db } from "..";
import { tags, promoCodeTags } from "../schema";
import { requireAdminSession } from "./auth-guards";
import { ROUTES } from "@/constants/routes";
import { actorFromSession, createAuditLog } from "@/lib/db/audit";

type TagCreateInput = z.infer<typeof TagCreateSchema>;
type TagUpdateInput = z.infer<typeof TagUpdateSchema>;

export async function slugifyTag(name: string): Promise<string> {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function getTagById(id: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  return tag ?? null;
}

export async function getTagByName(name: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(sql`LOWER(${tags.name}) = LOWER(${name})`)
    .limit(1);

  return tag ?? null;
}

export async function getTagsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(tags).where(inArray(tags.id, ids));
}

export async function listTags() {
  const tagList = await db
    .select({
      tag: tags,
      promoCodeCount: sql<number>`count(${promoCodeTags.id})::int`,
    })
    .from(tags)
    .leftJoin(promoCodeTags, eq(promoCodeTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.name));

  return tagList.map(({ tag, promoCodeCount }) => ({
    ...tag,
    promoCodeCount,
  }));
}

async function assertTagNameAvailable(name: string, excludeId?: string) {
  const existing = await getTagByName(name.trim());
  if (existing && existing.id !== excludeId) {
    return new ValidationError({ name: ["Tag name already exists"] });
  }
  return null;
}

export async function createTag(
  params: TagCreateInput,
): Promise<ActionResponse<{ tagId: string }> | ErrorResponse> {
  const validationResult = await action<TagCreateInput>({
    params,
    schema: TagCreateSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const data = validationResult.params as TagCreateInput;

  try {
    const { session } = await requireAdminSession();

    const nameError = await assertTagNameAvailable(data.name);
    if (nameError) {
      return handleError(nameError) as ErrorResponse;
    }

    const [created] = await db
      .insert(tags)
      .values({
        name: data.name.trim(),
        slug: await slugifyTag(data.name),
        color: data.color || null,
        updatedAt: new Date(),
      })
      .returning({ id: tags.id });

    revalidatePath(ROUTES.ADMIN.PROMO_CODES.TAGS);

    void createAuditLog({
      category: "admin",
      action: "tag.create",
      ...actorFromSession(session),
      entityType: "tag",
      entityId: created.id,
      summary: `Created tag "${data.name.trim()}"`,
      metadata: { color: data.color ?? null },
    });

    return {
      success: true,
      data: { tagId: created.id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateTag(
  params: { id: string } & TagUpdateInput,
): Promise<ActionResponse<{ tagId: string }> | ErrorResponse> {
  const { id, ...rest } = params;
  const validationResult = await action<TagUpdateInput>({
    params: rest,
    schema: TagUpdateSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const data = validationResult.params as TagUpdateInput;

  try {
    const { session } = await requireAdminSession();

    const existing = await getTagById(id);
    if (!existing) {
      return handleError(new NotFoundError("Tag")) as ErrorResponse;
    }

    if (data.name !== undefined && data.name !== existing.name) {
      const nameError = await assertTagNameAvailable(data.name, id);
      if (nameError) {
        return handleError(nameError) as ErrorResponse;
      }
    }

    const [updated] = await db
      .update(tags)
      .set({
        name: data.name !== undefined ? data.name.trim() : existing.name,
        slug:
          data.name !== undefined ? await slugifyTag(data.name) : existing.slug,
        color: data.color !== undefined ? data.color || null : existing.color,
        updatedAt: new Date(),
      })
      .where(eq(tags.id, id))
      .returning({ id: tags.id });

    revalidatePath(ROUTES.ADMIN.PROMO_CODES.TAGS);

    void createAuditLog({
      category: "admin",
      action: "tag.update",
      ...actorFromSession(session),
      entityType: "tag",
      entityId: updated.id,
      summary: `Updated tag "${data.name?.trim() ?? existing.name}"`,
      metadata: { color: data.color !== undefined ? data.color ?? null : existing.color },
    });

    return {
      success: true,
      data: { tagId: updated.id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteTag(
  id: string,
): Promise<ActionResponse<{ tagId: string }> | ErrorResponse> {
  try {
    const { session } = await requireAdminSession();

    const existing = await getTagById(id);
    if (!existing) {
      return handleError(new NotFoundError("Tag")) as ErrorResponse;
    }

    // Join rows are removed via ON DELETE CASCADE; promo codes are untouched.
    await db.delete(tags).where(eq(tags.id, id));

    revalidatePath(ROUTES.ADMIN.PROMO_CODES.TAGS);

    void createAuditLog({
      category: "admin",
      action: "tag.delete",
      ...actorFromSession(session),
      entityType: "tag",
      entityId: id,
      summary: `Deleted tag "${existing.name}"`,
    });

    return {
      success: true,
      data: { tagId: id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPromoCodeTags(promoCodeId: string) {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
    })
    .from(promoCodeTags)
    .innerJoin(tags, eq(promoCodeTags.tagId, tags.id))
    .where(eq(promoCodeTags.promoCodeId, promoCodeId))
    .orderBy(asc(tags.name));
}
