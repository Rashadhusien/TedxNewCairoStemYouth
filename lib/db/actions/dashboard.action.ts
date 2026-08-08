"use server";

import { and, count, eq, gte, isNull, sql, sum } from "drizzle-orm";
import { subDays } from "date-fns";

import handleError from "@/lib/handlers/error";
import type { ActionResponse, ErrorResponse } from "@/types/actions";

import { db } from "..";
import {
  coupons,
  offers,
  orders,
  speakers,
  sponsors,
  tickets,
  users,
} from "../schema";
import { requireAdminSession } from "./auth-guards";

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
};

const TICKET_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  payment_submitted: "Awaiting Review",
  confirmed: "Confirmed",
  rejected: "Rejected",
  checked_in: "Checked In",
  cancelled: "Cancelled",
};

const ROLE_LABELS: Record<string, string> = {
  attendee: "Attendee",
  organizer: "Organizer",
  admin: "Admin",
  sponsor: "Sponsor",
};

export type DashboardDayPoint = {
  date: string;
  count: number;
};

export type DashboardRevenueDayPoint = {
  date: string;
  amountPiastres: number;
};

export type DashboardBreakdownItem = {
  key: string;
  label: string;
  count: number;
};

export type DashboardStats = {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisWeek: number;
    totalOrders: number;
    pendingPayment: number;
    paidOrders: number;
    totalTickets: number;
    confirmedTickets: number;
    checkedInTickets: number;
    totalRevenuePiastres: number;
    checkInRate: number;
  };
  ordersByStatus: DashboardBreakdownItem[];
  ordersByPackage: DashboardBreakdownItem[];
  ticketsByStatus: DashboardBreakdownItem[];
  registrationsByDay: DashboardDayPoint[];
  revenueByDay: DashboardRevenueDayPoint[];
  usersByRole: DashboardBreakdownItem[];
  signupsByDay: DashboardDayPoint[];
  coupons: {
    total: number;
    active: number;
    totalRedemptions: number;
  };
  offers: {
    total: number;
    active: number;
    expiringSoon: number;
  };
  sponsors: {
    total: number;
    active: number;
  };
  speakers: {
    total: number;
    main: number;
    keyholder: number;
  };
};

export async function getDashboardStats(): Promise<
  ActionResponse<DashboardStats> | ErrorResponse
> {
  try {
    await requireAdminSession();

    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [
      userTotals,
      newUsersThisWeek,
      orderStatusRows,
      orderPackageRows,
      orderRevenueRow,
      pendingPaymentRow,
      paidOrdersRow,
      ticketStatusRows,
      confirmedRow,
      checkedInRow,
      registrationDays,
      revenueDays,
      roleRows,
      signupDays,
      couponStats,
      offerStats,
      expiringOffers,
      sponsorStats,
      speakerStats,
    ] = await Promise.all([
      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${users.isActive} = true)::int`,
        })
        .from(users),

      db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, sevenDaysAgo)),

      db
        .select({
          status: orders.status,
          count: count(),
        })
        .from(orders)
        .groupBy(orders.status),

      db
        .select({
          packageName: orders.packageName,
          count: count(),
        })
        .from(orders)
        .groupBy(orders.packageName),

      db
        .select({
          total: sum(orders.finalAmountPiastres),
        })
        .from(orders)
        .where(eq(orders.status, "paid")),

      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.status, "pending_payment")),

      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.status, "paid")),

      db
        .select({
          status: tickets.status,
          count: count(),
        })
        .from(tickets)
        .groupBy(tickets.status),

      db
        .select({ count: count() })
        .from(tickets)
        .where(eq(tickets.status, "confirmed")),

      db
        .select({ count: count() })
        .from(tickets)
        .where(eq(tickets.status, "checked_in")),

      db
        .select({
          date: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
          count: sql<number>`count(*)::int`,
        })
        .from(orders)
        .where(gte(orders.createdAt, thirtyDaysAgo))
        .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
        .orderBy(sql`date_trunc('day', ${orders.createdAt})`),

      db
        .select({
          date: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
          amountPiastres: sql<number>`coalesce(sum(${orders.finalAmountPiastres}), 0)::int`,
        })
        .from(orders)
        .where(
          and(gte(orders.createdAt, thirtyDaysAgo), eq(orders.status, "paid")),
        )
        .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
        .orderBy(sql`date_trunc('day', ${orders.createdAt})`),

      db
        .select({
          role: users.role,
          count: count(),
        })
        .from(users)
        .groupBy(users.role),

      db
        .select({
          date: sql<string>`to_char(date_trunc('day', ${users.createdAt}), 'YYYY-MM-DD')`,
          count: sql<number>`count(*)::int`,
        })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))
        .groupBy(sql`date_trunc('day', ${users.createdAt})`)
        .orderBy(sql`date_trunc('day', ${users.createdAt})`),

      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${coupons.isActive} = true)::int`,
          totalRedemptions: sql<number>`coalesce(sum(${coupons.usedCount}), 0)::int`,
        })
        .from(coupons),

      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${offers.isActive} = true)::int`,
        })
        .from(offers),

      db
        .select({ count: count() })
        .from(offers)
        .where(
          and(
            eq(offers.isActive, true),
            sql`${offers.endsAt} is not null`,
            sql`${offers.endsAt} <= ${sevenDaysFromNow}`,
            sql`${offers.endsAt} >= ${new Date()}`,
          ),
        ),

      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${sponsors.isActive} = true)::int`,
        })
        .from(sponsors),

      db
        .select({
          total: sql<number>`count(*) filter (where ${speakers.deletedAt} is null)::int`,
          main: sql<number>`count(*) filter (where ${speakers.deletedAt} is null and ${speakers.type} = 'main')::int`,
          keyholder: sql<number>`count(*) filter (where ${speakers.deletedAt} is null and ${speakers.type} = 'keyholder')::int`,
        })
        .from(speakers)
        .where(isNull(speakers.deletedAt)),
    ]);

    const totalOrders = orderStatusRows.reduce(
      (acc, row) => acc + Number(row.count),
      0,
    );
    const totalTickets = ticketStatusRows.reduce(
      (acc, row) => acc + Number(row.count),
      0,
    );
    const confirmedTickets = Number(confirmedRow[0]?.count ?? 0);
    const checkedInTickets = Number(checkedInRow[0]?.count ?? 0);
    const eligibleForCheckIn = confirmedTickets + checkedInTickets;
    const checkInRate =
      eligibleForCheckIn > 0
        ? Math.round((checkedInTickets / eligibleForCheckIn) * 100)
        : 0;

    const stats: DashboardStats = {
      overview: {
        totalUsers: Number(userTotals[0]?.total ?? 0),
        activeUsers: Number(userTotals[0]?.active ?? 0),
        newUsersThisWeek: Number(newUsersThisWeek[0]?.count ?? 0),
        totalOrders,
        pendingPayment: Number(pendingPaymentRow[0]?.count ?? 0),
        paidOrders: Number(paidOrdersRow[0]?.count ?? 0),
        totalTickets,
        confirmedTickets,
        checkedInTickets,
        totalRevenuePiastres: Number(orderRevenueRow[0]?.total ?? 0),
        checkInRate,
      },
      ordersByStatus: orderStatusRows.map((row) => ({
        key: row.status,
        label: ORDER_STATUS_LABELS[row.status] ?? row.status,
        count: Number(row.count),
      })),
      ordersByPackage: orderPackageRows.map((row) => ({
        key: row.packageName,
        label: row.packageName,
        count: Number(row.count),
      })),
      ticketsByStatus: ticketStatusRows.map((row) => ({
        key: row.status,
        label: TICKET_STATUS_LABELS[row.status] ?? row.status,
        count: Number(row.count),
      })),
      registrationsByDay: registrationDays.map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),
      revenueByDay: revenueDays.map((row) => ({
        date: row.date,
        amountPiastres: Number(row.amountPiastres),
      })),
      usersByRole: roleRows.map((row) => ({
        key: row.role,
        label: ROLE_LABELS[row.role] ?? row.role,
        count: Number(row.count),
      })),
      signupsByDay: signupDays.map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),
      coupons: {
        total: Number(couponStats[0]?.total ?? 0),
        active: Number(couponStats[0]?.active ?? 0),
        totalRedemptions: Number(couponStats[0]?.totalRedemptions ?? 0),
      },
      offers: {
        total: Number(offerStats[0]?.total ?? 0),
        active: Number(offerStats[0]?.active ?? 0),
        expiringSoon: Number(expiringOffers[0]?.count ?? 0),
      },
      sponsors: {
        total: Number(sponsorStats[0]?.total ?? 0),
        active: Number(sponsorStats[0]?.active ?? 0),
      },
      speakers: {
        total: Number(speakerStats[0]?.total ?? 0),
        main: Number(speakerStats[0]?.main ?? 0),
        keyholder: Number(speakerStats[0]?.keyholder ?? 0),
      },
    };

    return { success: true, data: stats };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
