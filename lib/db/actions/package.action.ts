"use server";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import {
  PackageCreateSchema,
  PackageUpdateSchema,
  PackageListSchema,
} from "@/lib/validation";
import type { ActionResponse, ErrorResponse } from "@/types/actions";
import type { z } from "zod";

import { db } from "..";
import { packages } from "../schema";
import { requireAdminSession } from "./auth-guards";
import { ROUTES } from "@/constants/routes";

type PackageCreateInput = z.infer<typeof PackageCreateSchema>;
type PackageUpdateInput = z.infer<typeof PackageUpdateSchema>;
type PackageListInput = z.infer<typeof PackageListSchema>;

export async function getActivePackages() {
  const activePackages = await db
    .select()
    .from(packages)
    .where(eq(packages.isActive, true))
    .orderBy(packages.displayOrder);

  return activePackages;
}

export async function getPackageById(id: string) {
  const [pkg] = await db
    .select()
    .from(packages)
    .where(eq(packages.id, id))
    .limit(1);

  return pkg ?? null;
}

export async function listPackages(params: PackageListInput): Promise<
  | ActionResponse<{
      packages: (typeof packages.$inferSelect)[];
      total: number;
    }>
  | ErrorResponse
> {
  try {
    const { status, search, page, pageSize } = params;

    const conditions = [];

    if (status === "active") {
      conditions.push(eq(packages.isActive, true));
    } else if (status === "inactive") {
      conditions.push(eq(packages.isActive, false));
    }

    if (search) {
      conditions.push(
        or(
          ilike(packages.name, `%${search}%`),
          ilike(packages.description || "", `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(packages)
      .where(whereClause);

    const total = countResult?.count || 0;

    const packageList = await db
      .select()
      .from(packages)
      .where(whereClause)
      .orderBy(packages.displayOrder, desc(packages.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      success: true,
      data: {
        packages: packageList,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createPackage(
  params: PackageCreateInput,
): Promise<ActionResponse<{ packageId: string }> | ErrorResponse> {
  const validationResult = await action<PackageCreateInput>({
    params,
    schema: PackageCreateSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;
  const data = validationResult.params as PackageCreateInput;

  try {
    await requireAdminSession();

    const calculatedTotal = data.ticketCount * data.pricePerTicketPiastres;

    const [created] = await db
      .insert(packages)
      .values({
        name: data.name,
        description: data.description,
        ticketCount: data.ticketCount,
        pricePerTicketPiastres: data.pricePerTicketPiastres,
        discountedPricePerTicketPiastres: data.discountedPricePerTicketPiastres,
        totalPricePiastres: calculatedTotal,
        requiresAccessCode: data.requiresAccessCode,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
        createdBy: session.user.id,
      })
      .returning({ id: packages.id });

    return {
      success: true,
      data: { packageId: created.id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updatePackage(
  params: { id: string } & PackageUpdateInput,
): Promise<ActionResponse<{ packageId: string }> | ErrorResponse> {
  const { id, ...rest } = params;
  const validationResult = await action<PackageUpdateInput>({
    params: rest,
    schema: PackageUpdateSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const session = validationResult.session!;
  const data = validationResult.params as PackageUpdateInput;

  try {
    await requireAdminSession();

    const existing = await getPackageById(id);
    if (!existing) {
      return handleError(new NotFoundError("Package")) as ErrorResponse;
    }

    const calculatedTotal =
      (data.ticketCount ?? existing.ticketCount) *
      (data.pricePerTicketPiastres ?? existing.pricePerTicketPiastres);

    const [updated] = await db
      .update(packages)
      .set({
        name: data.name,
        description: data.description,
        ticketCount: data.ticketCount,
        pricePerTicketPiastres: data.pricePerTicketPiastres,
        discountedPricePerTicketPiastres: data.discountedPricePerTicketPiastres,
        totalPricePiastres: calculatedTotal,
        requiresAccessCode: data.requiresAccessCode,
        isPromoApplicable: data.isPromoApplicable,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning({ id: packages.id });

    revalidatePath(ROUTES.ADMIN.PACKAGES.HOME);

    return {
      success: true,
      data: { packageId: updated.id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function togglePackageActive(
  id: string,
): Promise<
  ActionResponse<{ packageId: string; isActive: boolean }> | ErrorResponse
> {
  try {
    await requireAdminSession();

    const existing = await getPackageById(id);
    if (!existing) {
      return handleError(new NotFoundError("Package")) as ErrorResponse;
    }

    const [updated] = await db
      .update(packages)
      .set({
        isActive: !existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning({ id: packages.id, isActive: packages.isActive });

    revalidatePath(ROUTES.ADMIN.PACKAGES.HOME);

    return {
      success: true,
      data: { packageId: updated.id, isActive: updated.isActive },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deletePackage(
  id: string,
): Promise<ActionResponse<{ packageId: string }> | ErrorResponse> {
  try {
    await requireAdminSession();

    const existing = await getPackageById(id);
    if (!existing) {
      return handleError(new NotFoundError("Package")) as ErrorResponse;
    }

    await db.delete(packages).where(eq(packages.id, id));

    revalidatePath(ROUTES.ADMIN.PACKAGES.HOME);

    return {
      success: true,
      data: { packageId: id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
