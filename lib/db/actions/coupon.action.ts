"use server";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import {
  computeFinalPrice,
  couponAppliesToTier,
  getBasePrice,
  isCouponActive,
  pickBestOffer,
  type PurchasableTicketType,
} from "@/lib/pricing";
import {
  CouponListSchema,
  CouponSchema,
  TicketListSchema,
  ValidateCouponSchema,
} from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

type CouponInput = z.infer<typeof CouponSchema>;
import type { CouponValidationResult } from "@/types/ticket";

type CouponListInput = z.infer<typeof CouponListSchema>;

import { db } from "..";
import { coupons, offers, tickets } from "../schema";
import { assertUserIsActive, requireAdminSession } from "./auth-guards";
import { serverAnalytics } from "@/lib/analytics/server";
import { actorFromSession, createAuditLog } from "@/lib/db/audit";

export async function validateCoupon(params: {
  code: string;
  ticketType: PurchasableTicketType;
}): Promise<ActionResponse<CouponValidationResult>> {
  const validationResult = await action({
    params,
    schema: ValidateCouponSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { code, ticketType } = validationResult.params!;
  const session = validationResult.session!;

  try {
    await assertUserIsActive(session.user.id);

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(ilike(coupons.code, code.trim()))
      .limit(1);

    if (!coupon) {
      return {
        success: true,
        data: { valid: false, message: "Invalid coupon code" },
      };
    }

    if (!isCouponActive(coupon)) {
      return {
        success: true,
        data: { valid: false, message: "This coupon is no longer active" },
      };
    }

    if (!couponAppliesToTier(coupon, ticketType)) {
      return {
        success: true,
        data: {
          valid: false,
          message: "This coupon does not apply to the selected ticket tier",
        },
      };
    }

    if (coupon.maxUsesPerUser) {
      const [usage] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tickets)
        .where(
          and(
            eq(tickets.userId, session.user.id),
            eq(tickets.couponId, coupon.id),
          ),
        );

      if ((usage?.count ?? 0) >= coupon.maxUsesPerUser) {
        return {
          success: true,
          data: {
            valid: false,
            message:
              "You have already used this coupon the maximum number of times",
          },
        };
      }
    }

    const activeOffers = await db
      .select()
      .from(offers)
      .where(eq(offers.isActive, true));

    const bestOffer = pickBestOffer(activeOffers, ticketType);
    const breakdown = computeFinalPrice(ticketType, bestOffer, coupon);
    const basePrice = getBasePrice(ticketType);

    if (breakdown.priceAfterOffer < coupon.minOrderAmount) {
      return {
        success: true,
        data: {
          valid: false,
          message: `Minimum order amount is ${coupon.minOrderAmount / 100} EGP`,
        },
      };
    }

    if (breakdown.couponDiscountApplied <= 0) {
      return {
        success: true,
        data: { valid: false, message: "Coupon does not apply to this order" },
      };
    }

    return {
      success: true,
      data: {
        valid: true,
        message: "Coupon applied successfully",
        discountAmount: breakdown.couponDiscountApplied,
        couponId: coupon.id,
        finalPrice: breakdown.finalPrice,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createCoupon(
  params: CouponInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const validationResult = await action<CouponInput>({
    params,
    schema: CouponSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { session } = await requireAdminSession();
    const data = validationResult.params as CouponInput;

    const [created] = await db
      .insert(coupons)
      .values({
        ...data,
        code: data.code.trim().toUpperCase(),
        createdBy: session.user.id,
        updatedAt: new Date(),
      })
      .returning({ id: coupons.id });

    serverAnalytics.capture("admin_coupon_created", session.user.id, {
      coupon_code: data.code.trim().toUpperCase(),
      discount_type: data.type,
      discount_value:
        data.type === "fixed" ? data.discountAmount : data.percentageOff,
      admin_id: session.user.id,
    });

    void createAuditLog({
      category: "admin",
      action: "coupon.create",
      ...actorFromSession(session),
      entityType: "coupon",
      entityId: created.id,
      summary: `Created coupon ${data.code.trim().toUpperCase()}`,
      metadata: {
        type: data.type,
        discountAmount: data.discountAmount,
        percentageOff: data.percentageOff,
        isActive: data.isActive,
      },
    });

    return { success: true, data: { id: created.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateCoupon(
  params: { id: string } & CouponInput,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  const { id, ...rest } = params;
  const validationResult = await action<CouponInput>({
    params: rest,
    schema: CouponSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const { session } = await requireAdminSession();
    const data = validationResult.params as CouponInput;

    const [updated] = await db
      .update(coupons)
      .set({
        ...data,
        code: data.code.trim().toUpperCase(),
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, id))
      .returning({ id: coupons.id });

    if (!updated) {
      return handleError(new NotFoundError("Coupon")) as ErrorResponse;
    }

    void createAuditLog({
      category: "admin",
      action: "coupon.update",
      ...actorFromSession(session),
      entityType: "coupon",
      entityId: updated.id,
      summary: `Updated coupon ${data.code.trim().toUpperCase()}`,
      metadata: {
        type: data.type,
        discountAmount: data.discountAmount,
        percentageOff: data.percentageOff,
        isActive: data.isActive,
      },
    });

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function listCoupons(params: CouponListInput): Promise<
  ActionResponse<{
    items: (typeof coupons.$inferSelect)[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: CouponListSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await requireAdminSession();
    const { page, pageSize, status, search } = validationResult.params!;

    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(coupons.isActive, status === "active"));
    }

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(ilike(coupons.code, term), ilike(coupons.description, term)),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(coupons)
      .where(whereClause);

    const items = await db
      .select()
      .from(coupons)
      .where(whereClause)
      .orderBy(desc(coupons.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      success: true,
      data: {
        items,
        total: countRow?.count ?? 0,
        page,
        pageSize,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteCoupon(
  id: string,
): Promise<ActionResponse<{ id: string }> | ErrorResponse> {
  try {
    const { session } = await requireAdminSession();

    const [updated] = await db
      .update(coupons)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning({ id: coupons.id });

    if (!updated) {
      return handleError(new NotFoundError("Coupon")) as ErrorResponse;
    }

    void createAuditLog({
      category: "admin",
      action: "coupon.delete",
      ...actorFromSession(session),
      entityType: "coupon",
      entityId: updated.id,
      summary: `Deactivated coupon ${id}`,
    });

    return { success: true, data: { id: updated.id } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
