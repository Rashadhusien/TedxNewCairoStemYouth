"use server";

import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import {
  PromoCodeCreateSchema,
  PromoCodeUpdateSchema,
  PromoCodeListSchema,
  ValidatePromoCodeSchema,
} from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

import { db } from "..";
import {
  promoCodes,
  promoCodeUsages,
  promoCodeTags,
  orders,
  tags,
} from "../schema";
import { requireAdminSession } from "./auth-guards";
import { getTagsByIds, getPromoCodeTags } from "./tag.action";
import { ROUTES } from "@/constants/routes";

type PromoCodeCreateInput = z.infer<typeof PromoCodeCreateSchema>;
type PromoCodeUpdateInput = z.infer<typeof PromoCodeUpdateSchema>;
type PromoCodeListInput = z.infer<typeof PromoCodeListSchema>;
type ValidatePromoCodeInput = z.infer<typeof ValidatePromoCodeSchema>;

export async function getActivePromoCodes() {
  const now = new Date();
  const activeCodes = await db
    .select()
    .from(promoCodes)
    .where(
      and(
        eq(promoCodes.isActive, true),
        sql`${promoCodes.deletedAt} IS NULL`,
        or(
          sql`${promoCodes.validFrom} IS NULL`,
          sql`${promoCodes.validFrom} <= ${now}`,
        ),
        or(
          sql`${promoCodes.validUntil} IS NULL`,
          sql`${promoCodes.validUntil} >= ${now}`,
        ),
      ),
    )
    .orderBy(desc(promoCodes.createdAt));

  return activeCodes;
}

export async function getPromoCodeById(id: string) {
  const [code] = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.id, id))
    .limit(1);

  return code ?? null;
}

export async function getPromoCodeByCode(code: string) {
  const [promoCode] = await db
    .select()
    .from(promoCodes)
    .where(
      and(
        sql`LOWER(${promoCodes.code}) = LOWER(${code})`,
        sql`${promoCodes.deletedAt} IS NULL`,
      ),
    )
    .limit(1);

  return promoCode ?? null;
}

export async function listPromoCodes(params: PromoCodeListInput): Promise<
  | ActionResponse<{
      promoCodes: (typeof promoCodes.$inferSelect)[];
      total: number;
    }>
  | ErrorResponse
> {
  try {
    const { status, search, page, pageSize, tagIds } = params;

    const conditions = [sql`${promoCodes.deletedAt} IS NULL`];

    if (status === "active") {
      conditions.push(eq(promoCodes.isActive, true));
    } else if (status === "inactive") {
      conditions.push(eq(promoCodes.isActive, false));
    }

    if (search) {
      const searchConditions = or(
        ilike(promoCodes.code, `%${search}%`),
        ilike(promoCodes.owner || "", `%${search}%`),
        ilike(promoCodes.description || "", `%${search}%`),
      );
      if (searchConditions) {
        conditions.push(searchConditions);
      }
    }

    // AND filtering: promo code must belong to ALL selected tags
    if (tagIds && tagIds.length > 0) {
      conditions.push(
        sql`${promoCodes.id} IN (
          SELECT ${promoCodeTags.promoCodeId}
          FROM ${promoCodeTags}
          WHERE ${inArray(promoCodeTags.tagId, tagIds)}
          GROUP BY ${promoCodeTags.promoCodeId}
          HAVING count(DISTINCT ${promoCodeTags.tagId}) = ${tagIds.length}
        )`,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(promoCodes)
      .where(whereClause ?? sql`1=1`);

    const total = countResult?.count || 0;

    const promoCodeList = await db
      .select()
      .from(promoCodes)
      .where(whereClause ?? sql`1=1`)
      .orderBy(desc(promoCodes.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Attach tags to each row (batched, DB-level lookup)
    const rowsWithTags = await attachTagsToPromoCodes(promoCodeList);

    return {
      success: true,
      data: {
        promoCodes: rowsWithTags,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

async function attachTagsToPromoCodes(
  promoCodeList: (typeof promoCodes.$inferSelect)[],
) {
  if (promoCodeList.length === 0) return promoCodeList;

  const ids = promoCodeList.map((p) => p.id);
  const tagRows = await db
    .select({
      promoCodeId: promoCodeTags.promoCodeId,
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
    })
    .from(promoCodeTags)
    .innerJoin(tags, eq(promoCodeTags.tagId, tags.id))
    .where(inArray(promoCodeTags.promoCodeId, ids));

  type PromoTag = { id: string; name: string; slug: string; color: string | null };
  const tagsByPromo = new Map<string, PromoTag[]>();
  for (const row of tagRows) {
    const list = tagsByPromo.get(row.promoCodeId) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      color: row.color,
    });
    tagsByPromo.set(row.promoCodeId, list);
  }

  return promoCodeList.map((promoCode) => ({
    ...promoCode,
    tags: tagsByPromo.get(promoCode.id) ?? [],
  }));
}

export async function validatePromoCode(
  params: ValidatePromoCodeInput,
): Promise<
  | ActionResponse<{
      valid: boolean;
      promoCode?: {
        id: string;
        code: string;
        type: string;
        valuePiastres: number;
        maxUses: number | null;
        usedCount: number;
      };
      error?: string;
    }>
  | ErrorResponse
> {
  try {
    const promoCode = await getPromoCodeByCode(params.code);

    if (!promoCode) {
      return {
        success: true,
        data: { valid: false, error: "Invalid promo code" },
      };
    }

    if (!promoCode.isActive) {
      return {
        success: true,
        data: { valid: false, error: "Promo code is inactive" },
      };
    }

    const now = new Date();
    if (promoCode.validFrom && promoCode.validFrom > now) {
      return {
        success: true,
        data: { valid: false, error: "Promo code is not yet valid" },
      };
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      return {
        success: true,
        data: { valid: false, error: "Promo code has expired" },
      };
    }

    if (
      promoCode.maxUses !== null &&
      promoCode.usedCount >= promoCode.maxUses
    ) {
      return {
        success: true,
        data: {
          valid: false,
          error: "Promo code has reached maximum usage limit",
        },
      };
    }

    // Check if promo applies to the package (if packageId provided)
    if (params.packageId) {
      const { getPackageById } = await import("./package.action");
      const pkg = await getPackageById(params.packageId);
      if (pkg && !pkg.isPromoApplicable) {
        return {
          success: true,
          data: {
            valid: false,
            error: "Promo code does not apply to this package",
          },
        };
      }
    }

    // Return limited promo code data (not full object with sensitive fields)
    return {
      success: true,
      data: {
        valid: true,
        promoCode: {
          id: promoCode.id,
          code: promoCode.code,
          type: promoCode.type,
          valuePiastres: promoCode.valuePiastres,
          maxUses: promoCode.maxUses,
          usedCount: promoCode.usedCount,
        },
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

async function validateAndSyncTags(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  promoCodeId: string,
  tagIds?: string[],
) {
  const ids = tagIds ?? [];
  if (ids.length === 0) return;

  const existingTags = await getTagsByIds(ids);
  if (existingTags.length !== new Set(ids).size) {
    throw new ValidationError({ tagIds: ["One or more tags do not exist"] });
  }

  // Insert only valid IDs, dedupe + ignore existing (unique constraint safety)
  const uniqueIds = [...new Set(existingTags.map((t) => t.id))];
  await tx
    .insert(promoCodeTags)
    .values(
      uniqueIds.map((tagId) => ({
        promoCodeId,
        tagId,
        createdAt: new Date(),
      })),
    )
    .onConflictDoNothing();
}

async function replacePromoCodeTags(promoCodeId: string, tagIds?: string[]) {
  if (!tagIds) return;

  const existingTags = await getTagsByIds(tagIds);
  if (existingTags.length !== new Set(tagIds).size) {
    throw new ValidationError({ tagIds: ["One or more tags do not exist"] });
  }

  await db.transaction(async (tx) => {
    await tx.delete(promoCodeTags).where(eq(promoCodeTags.promoCodeId, promoCodeId));

    const uniqueIds = [...new Set(existingTags.map((t) => t.id))];
    if (uniqueIds.length > 0) {
      await tx
        .insert(promoCodeTags)
        .values(
          uniqueIds.map((tagId) => ({
            promoCodeId,
            tagId,
            createdAt: new Date(),
          })),
        )
        .onConflictDoNothing();
    }
  });
}

export async function createPromoCode(
  params: PromoCodeCreateInput,
): Promise<ActionResponse<{ promoCodeId: string }> | ErrorResponse> {
  const validationResult = await action<PromoCodeCreateInput>({
    params,
    schema: PromoCodeCreateSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;
  const data = validationResult.params as PromoCodeCreateInput;

  try {
    await requireAdminSession();

    const existing = await getPromoCodeByCode(data.code);
    if (existing) {
      return handleError(
        new ValidationError({ code: ["Promo code already exists"] }),
      ) as ErrorResponse;
    }

    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(promoCodes)
        .values({
          code: data.code,
          owner: data.owner,
          description: data.description,
          type: data.type,
          valuePiastres: data.valuePiastres,
          maxUses: data.maxUses,
          validFrom: data.validFrom,
          validUntil: data.validUntil,
          isActive: data.isActive,
          createdBy: session.user.id,
        })
        .returning({ id: promoCodes.id });

      await validateAndSyncTags(tx, row.id, data.tagIds);

      return row;
    });

    return {
      success: true,
      data: { promoCodeId: created.id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updatePromoCode(
  params: { id: string } & PromoCodeUpdateInput,
): Promise<ActionResponse<{ promoCodeId: string }> | ErrorResponse> {
  const { id, ...rest } = params;
  const validationResult = await action<PromoCodeUpdateInput>({
    params: rest,
    schema: PromoCodeUpdateSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const data = validationResult.params as PromoCodeUpdateInput;

  try {
    await requireAdminSession();

    const existing = await getPromoCodeById(id);
    if (!existing) {
      return handleError(new NotFoundError("Promo code")) as ErrorResponse;
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await getPromoCodeByCode(data.code);
      if (codeExists) {
        return handleError(
          new ValidationError({ code: ["Promo code already exists"] }),
        ) as ErrorResponse;
      }
    }

    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(promoCodes)
        .set({
          code: data.code,
          owner: data.owner,
          description: data.description,
          type: data.type,
          valuePiastres: data.valuePiastres,
          maxUses: data.maxUses,
          validFrom: data.validFrom,
          validUntil: data.validUntil,
          isActive: data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(promoCodes.id, id))
        .returning({ id: promoCodes.id });

      if (data.tagIds !== undefined) {
        await replacePromoCodeTags(id, data.tagIds);
      }

      return row;
    });

    revalidatePath(ROUTES.ADMIN.PROMO_CODES.HOME);

    return {
      success: true,
      data: { promoCodeId: updated.id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function togglePromoCodeActive(
  id: string,
): Promise<
  ActionResponse<{ promoCodeId: string; isActive: boolean }> | ErrorResponse
> {
  try {
    await requireAdminSession();

    const existing = await getPromoCodeById(id);
    if (!existing) {
      return handleError(new NotFoundError("Promo code")) as ErrorResponse;
    }

    const [updated] = await db
      .update(promoCodes)
      .set({
        isActive: !existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(promoCodes.id, id))
      .returning({ id: promoCodes.id, isActive: promoCodes.isActive });

    revalidatePath(ROUTES.ADMIN.PROMO_CODES.HOME);

    return {
      success: true,
      data: { promoCodeId: updated.id, isActive: updated.isActive },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function softDeletePromoCode(
  id: string,
): Promise<ActionResponse<{ promoCodeId: string }> | ErrorResponse> {
  try {
    await requireAdminSession();

    const existing = await getPromoCodeById(id);
    if (!existing) {
      return handleError(new NotFoundError("Promo code")) as ErrorResponse;
    }

    await db
      .update(promoCodes)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(promoCodes.id, id));

    revalidatePath(ROUTES.ADMIN.PROMO_CODES.HOME);

    return {
      success: true,
      data: { promoCodeId: id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPromoCodeUsageHistory(promoCodeId: string) {
  const usageHistory = await db
    .select({
      usage: promoCodeUsages,
      order: orders,
    })
    .from(promoCodeUsages)
    .innerJoin(orders, eq(promoCodeUsages.orderId, orders.id))
    .where(eq(promoCodeUsages.promoCodeId, promoCodeId))
    .orderBy(desc(promoCodeUsages.usedAt));

  return usageHistory;
}

export async function getPromoCodeWithTags(id: string) {
  const [promoCode] = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.id, id))
    .limit(1);

  if (!promoCode) return null;

  const promoCodeTagsList = await getPromoCodeTags(id);

  return {
    ...promoCode,
    tags: promoCodeTagsList,
  };
}

export async function incrementPromoCodeUsage(promoCodeId: string) {
  const [updated] = await db
    .update(promoCodes)
    .set({
      usedCount: sql`${promoCodes.usedCount} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(promoCodes.id, promoCodeId),
        sql`(${promoCodes.maxUses} IS NULL OR ${promoCodes.usedCount} < ${promoCodes.maxUses})`,
      ),
    )
    .returning({ usedCount: promoCodes.usedCount });

  if (!updated) {
    throw new Error("Promo code has reached maximum usage limit");
  }

  return updated.usedCount;
}

export async function decrementPromoCodeUsage(promoCodeId: string) {
  const [updated] = await db
    .update(promoCodes)
    .set({
      usedCount: sql`GREATEST(${promoCodes.usedCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(promoCodes.id, promoCodeId))
    .returning({ usedCount: promoCodes.usedCount });

  return updated?.usedCount || 0;
}

export async function createPromoCodeUsageRecord(params: {
  promoCodeId: string;
  orderId: string;
  originalAmountPiastres: number;
  discountPiastres: number;
  finalAmountPiastres: number;
}) {
  const [created] = await db
    .insert(promoCodeUsages)
    .values({
      promoCodeId: params.promoCodeId,
      orderId: params.orderId,
      originalAmountPiastres: params.originalAmountPiastres,
      discountPiastres: params.discountPiastres,
      finalAmountPiastres: params.finalAmountPiastres,
      usedAt: new Date(),
    })
    .returning({ id: promoCodeUsages.id });

  return created?.id;
}
