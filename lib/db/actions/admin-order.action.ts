"use server";

import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";

import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import {
  SearchCustomersSchema,
  GetApplicablePromoCodesSchema,
  CreateAdminOrderSchema,
} from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";
import { notifyTicketConfirmed } from "@/lib/email/send-ticket-emails";

import { db } from "..";
import {
  users,
  orders,
  tickets,
  promoCodes,
  promoCodeUsages,
  auditLogs,
} from "../schema";
import { requireAdminSession } from "./auth-guards";
import { getPackageById } from "./package.action";
import { getPromoCodeByCode } from "./promo-code.action";
import { getTicketLimitSetting } from "./setting.action";
import { actorFromSession, createAuditLog } from "@/lib/db/audit";

type SearchCustomersInput = z.infer<typeof SearchCustomersSchema>;
type GetApplicablePromoCodesInput = z.infer<
  typeof GetApplicablePromoCodesSchema
>;
type CreateAdminOrderInput = z.infer<typeof CreateAdminOrderSchema>;

export async function searchCustomers(params: SearchCustomersInput): Promise<
  | ActionResponse<{
      users: Array<{
        id: string;
        fullName: string | null;
        email: string;
        phone: string | null;
        isActive: boolean;
      }>;
    }>
  | ErrorResponse
> {
  try {
    await requireAdminSession();
    const { search } = params;

    const usersList = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        isActive: users.isActive,
      })
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          or(
            ilike(users.email, `%${search}%`),
            ilike(users.fullName, `%${search}%`),
          ),
        ),
      )
      .limit(10);

    return { success: true, data: { users: usersList } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getApplicablePromoCodes(
  params: GetApplicablePromoCodesInput,
): Promise<
  | ActionResponse<{ promoCodes: (typeof promoCodes.$inferSelect)[] }>
  | ErrorResponse
> {
  try {
    await requireAdminSession();
    const { packageId } = params;

    const pkg = await getPackageById(packageId);
    if (!pkg || !pkg.isActive) {
      return { success: true, data: { promoCodes: [] } };
    }

    const activePromoCodes = await db
      .select()
      .from(promoCodes)
      .where(
        and(
          eq(promoCodes.isActive, true),
          sql`${promoCodes.deletedAt} IS NULL`,
        ),
      );

    const now = new Date();
    const applicable = activePromoCodes.filter((pc) => {
      if (pc.validFrom && pc.validFrom > now) return false;
      if (pc.validUntil && pc.validUntil < now) return false;
      if (pc.maxUses !== null && pc.usedCount >= pc.maxUses) return false;
      // Removed isPromoApplicable check to allow promo codes on all packages for admin sales
      return true;
    });

    return { success: true, data: { promoCodes: applicable } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createAdminAssistedOrder(
  params: CreateAdminOrderInput,
): Promise<ActionResponse<{ orderId: string }> | ErrorResponse> {
  const validationResult = await action<CreateAdminOrderInput>({
    params,
    schema: CreateAdminOrderSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { session, user: adminUser } = await requireAdminSession();
  const data = validationResult.params as CreateAdminOrderInput;

  try {
    // Validate customer (only for registered mode)
    let customer = null;
    if (data.mode === "registered") {
      if (!data.customerUserId) {
        return handleError(
          new ValidationError({
            customer: ["Customer user ID is required for registered mode"],
          }),
        ) as ErrorResponse;
      }

      const [customerRecord] = await db
        .select()
        .from(users)
        .where(eq(users.id, data.customerUserId))
        .limit(1);

      if (!customerRecord) {
        return handleError(new NotFoundError("Customer")) as ErrorResponse;
      }

      if (!customerRecord.isActive) {
        return handleError(
          new ValidationError({ customer: ["Customer account is inactive"] }),
        ) as ErrorResponse;
      }

      customer = customerRecord;
    }

    // Validate package
    const pkg = await getPackageById(data.packageId);
    if (!pkg || !pkg.isActive) {
      return handleError(
        new ValidationError({ package: ["Package not available"] }),
      ) as ErrorResponse;
    }

    // Validate attendee count
    if (data.attendees.length !== pkg.ticketCount) {
      return handleError(
        new ValidationError({
          attendees: [
            `Package requires exactly ${pkg.ticketCount} attendee(s)`,
          ],
        }),
      ) as ErrorResponse;
    }

    // Only validate user accounts for registered mode
    let emailToUserIdMap: Record<string, string> = {};
    if (data.mode === "registered") {
      // Validate attendee emails have accounts
      const attendeeEmails = data.attendees
        .map((a) => a.email?.toLowerCase().trim())
        .filter((email): email is string => email !== undefined);
      const existingUsers = await db
        .select({ email: users.email, id: users.id })
        .from(users)
        .where(inArray(users.email, attendeeEmails));

      const existingEmails = existingUsers.map((u) => u.email.toLowerCase());
      const missingAccounts = data.attendees
        .filter(
          (a) =>
            a.email && !existingEmails.includes(a.email.toLowerCase().trim()),
        )
        .map((a) => a.email!);

      if (missingAccounts.length > 0) {
        return handleError(
          new ValidationError({
            attendees: [
              `Attendee emails without accounts: ${missingAccounts.join(", ")}`,
            ],
          }),
        ) as ErrorResponse;
      }

      // Create email to userId mapping
      existingUsers.forEach((user) => {
        emailToUserIdMap[user.email.toLowerCase()] = user.id;
      });
    }

    // Check global ticket limit
    const capacity = await getTicketLimitSetting();
    if (
      capacity.totalTicketsSold + pkg.ticketCount >
      capacity.maxTotalTickets
    ) {
      return handleError(
        new ValidationError({ tickets: ["Global ticket limit reached"] }),
      ) as ErrorResponse;
    }

    // Validate and calculate promo code
    let promoCodeRecord = null;
    let discountPiastres = 0;
    let finalAmountPiastres = pkg.totalPricePiastres;

    if (data.promoCode && data.promoCode.trim()) {
      promoCodeRecord = await getPromoCodeByCode(data.promoCode.trim());

      if (!promoCodeRecord || !promoCodeRecord.isActive) {
        return handleError(
          new ValidationError({
            promoCode: ["Invalid or inactive promo code"],
          }),
        ) as ErrorResponse;
      }

      const now = new Date();
      if (promoCodeRecord.validFrom && promoCodeRecord.validFrom > now) {
        return handleError(
          new ValidationError({ promoCode: ["Promo code not yet valid"] }),
        ) as ErrorResponse;
      }

      if (promoCodeRecord.validUntil && promoCodeRecord.validUntil < now) {
        return handleError(
          new ValidationError({ promoCode: ["Promo code expired"] }),
        ) as ErrorResponse;
      }

      if (
        promoCodeRecord.maxUses !== null &&
        promoCodeRecord.usedCount >= promoCodeRecord.maxUses
      ) {
        return handleError(
          new ValidationError({
            promoCode: ["Promo code usage limit reached"],
          }),
        ) as ErrorResponse;
      }

      // Removed isPromoApplicable check to allow promo codes on all packages for admin sales

      // Apply discount
      if (promoCodeRecord.type === "fixed_price") {
        finalAmountPiastres = promoCodeRecord.valuePiastres;
        discountPiastres = pkg.totalPricePiastres - finalAmountPiastres;
      } else if (promoCodeRecord.type === "discount") {
        discountPiastres = promoCodeRecord.valuePiastres;
        finalAmountPiastres = Math.max(
          0,
          pkg.totalPricePiastres - discountPiastres,
        );
      } else if (
        promoCodeRecord.type === "free" ||
        promoCodeRecord.type === "free_vip"
      ) {
        discountPiastres = pkg.totalPricePiastres;
        finalAmountPiastres = 0;
      }
    }

    // Calculate price per ticket
    const pricePerTicketPiastres = Math.floor(
      finalAmountPiastres / pkg.ticketCount,
    );

    // Check for existing operation (idempotency)
    if (data.operationId) {
      const [existingAudit] = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.action, "admin_order.create"),
            eq(auditLogs.actorUserId, adminUser.id),
            sql`${auditLogs.metadata}->>'operationId' = ${data.operationId}`,
          ),
        )
        .limit(1);

      if (existingAudit && existingAudit.entityId) {
        return {
          success: true,
          data: { orderId: existingAudit.entityId },
        };
      }
    }

    // Create order and tickets in transaction
    const now = new Date();
    const result = await db.transaction(async (tx) => {
      // Create order
      const [order] = await tx
        .insert(orders)
        .values({
          userId: data.mode === "guest" ? null : data.customerUserId,
          packageId: pkg.id,
          status: "paid",
          paidAt: now,
          paymentReference: data.paymentReference || null,
          adminUserId: adminUser.id,
          originalAmountPiastres: pkg.totalPricePiastres,
          discountPiastres,
          finalAmountPiastres,
          packageName: pkg.name,
          packageTicketCount: pkg.ticketCount,
          packagePricePerTicketPiastres: pricePerTicketPiastres,
          promoCodeId: promoCodeRecord?.id,
          promoCode: data.promoCode?.trim() || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: orders.id });

      // Create tickets
      const ticketIds = [];
      const ticketType =
        promoCodeRecord?.type === "free_vip" ? "vip" : "general";

      for (const attendee of data.attendees) {
        const attendeeUserId =
          data.mode === "guest"
            ? null
            : attendee.email
              ? emailToUserIdMap[attendee.email.toLowerCase().trim()]
              : null;

        const [ticket] = await tx
          .insert(tickets)
          .values({
            userId: attendeeUserId,
            orderId: order.id,
            type: ticketType,
            status: "confirmed",
            pricePaid: pricePerTicketPiastres,
            currency: "EGP",
            paymentMethod: "admin_assisted",
            attendeeName: attendee.name,
            attendeeEmail: attendee.email || null,
            attendeePhone: attendee.phone || null,
            reviewedAt: now,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: tickets.id, qrCode: tickets.qrCode });

        ticketIds.push({
          id: ticket.id,
          qrCode: ticket.qrCode,
          type: ticketType,
          attendeeName: attendee.name,
          attendeeEmail: attendee.email,
        });
      }

      // Mark promo code as used
      if (promoCodeRecord) {
        await tx.insert(promoCodeUsages).values({
          promoCodeId: promoCodeRecord.id,
          orderId: order.id,
          originalAmountPiastres: pkg.totalPricePiastres,
          discountPiastres,
          finalAmountPiastres,
          usedAt: now,
        });

        const [incremented] = await tx
          .update(promoCodes)
          .set({
            usedCount: sql`${promoCodes.usedCount} + 1`,
            updatedAt: now,
          })
          .where(
            and(
              eq(promoCodes.id, promoCodeRecord.id),
              sql`(${promoCodes.maxUses} IS NULL OR ${promoCodes.usedCount} < ${promoCodes.maxUses})`,
            ),
          )
          .returning({ usedCount: promoCodes.usedCount });

        if (!incremented) {
          throw new ValidationError({
            promoCode: ["Promo code usage limit reached during order creation"],
          });
        }
      }

      return { orderId: order.id, ticketIds };
    });

    // Send emails (fire-and-forget, outside transaction)
    for (const ticket of result.ticketIds) {
      // Only send email if attendee email is provided
      if (ticket.attendeeEmail) {
        notifyTicketConfirmed({
          ticketId: ticket.id,
          attendeeName: ticket.attendeeName,
          attendeeEmail: ticket.attendeeEmail,
          packageName: pkg.name,
          pricePaid: pricePerTicketPiastres,
          qrCode: ticket.qrCode,
          ticketType: ticket.type,
        });
      }
    }

    // Audit log
    void createAuditLog({
      category: "admin",
      action: "admin_order.create",
      ...actorFromSession(session),
      entityType: "order",
      entityId: result.orderId,
      summary:
        data.mode === "guest"
          ? `Admin-assisted guest order created for ${data.attendees.length} attendee(s)`
          : `Admin-assisted order created for customer ${customer?.email ?? data.customerUserId}`,
      metadata: {
        mode: data.mode,
        customerUserId: data.customerUserId,
        customerEmail: data.mode === "guest" ? null : (customer?.email ?? null),
        packageId: data.packageId,
        packageName: pkg.name,
        promoCode: data.promoCode || null,
        finalAmountPiastres,
        attendeeCount: data.attendees.length,
        paymentReference: data.paymentReference,
        operationId: data.operationId,
      },
    });

    if (promoCodeRecord) {
      void createAuditLog({
        category: "promo_code",
        action: "promo_code.used",
        ...actorFromSession(session),
        entityType: "promo_code",
        entityId: promoCodeRecord.id,
        summary: `Promo code "${promoCodeRecord.code}" used on admin-assisted order ${result.orderId}`,
        metadata: {
          orderId: result.orderId,
          discountPiastres,
          finalAmountPiastres,
          customerUserId: data.customerUserId,
        },
      });
    }

    return {
      success: true,
      data: { orderId: result.orderId },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
