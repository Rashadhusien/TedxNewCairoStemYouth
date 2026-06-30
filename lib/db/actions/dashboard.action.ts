"use server";

import { and, count, eq, gte, inArray, isNull, sql, sum } from "drizzle-orm";
import { subDays } from "date-fns";

import handleError from "@/lib/handlers/error";
import type { ActionResponse, ErrorResponse } from "@/types/actions";

import { db } from "..";
import {
  coupons,
  offers,
  speakers,
  sponsors,
  tickets,
  users,
} from "../schema";
import { requireAdminSession } from "./auth-guards";

const REVENUE_STATUSES = ["confirmed", "checked_in"] as const;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  payment_submitted: "Awaiting Review",
  confirmed: "Confirmed",
  rejected: "Rejected",
  checked_in: "Checked In",
  cancelled: "Cancelled",
};

const TYPE_LABELS: Record<string, string> = {
  general: "General",
  vip: "VIP",
  organizer: "Organizer",
  ip: "IP",
  np: "NP",
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
    totalTickets: number;
    pendingReview: number;
    confirmedTickets: number;
    checkedInTickets: number;
    totalRevenuePiastres: number;
    checkInRate: number;
  };
  ticketsByStatus: DashboardBreakdownItem[];
  ticketsByType: DashboardBreakdownItem[];
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
      ticketStatusRows,
      ticketTypeRows,
      revenueRow,
      pendingReviewRow,
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
          status: tickets.status,
          count: count(),
        })
        .from(tickets)
        .groupBy(tickets.status),

      db
        .select({
          type: tickets.type,
          count: count(),
        })
        .from(tickets)
        .groupBy(tickets.type),

      db
        .select({
          total: sum(tickets.pricePaid),
        })
        .from(tickets)
        .where(inArray(tickets.status, [...REVENUE_STATUSES])),

      db
        .select({ count: count() })
        .from(tickets)
        .where(eq(tickets.status, "payment_submitted")),

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
          date: sql<string>`to_char(date_trunc('day', ${tickets.createdAt}), 'YYYY-MM-DD')`,
          count: sql<number>`count(*)::int`,
        })
        .from(tickets)
        .where(gte(tickets.createdAt, thirtyDaysAgo))
        .groupBy(sql`date_trunc('day', ${tickets.createdAt})`)
        .orderBy(sql`date_trunc('day', ${tickets.createdAt})`),

      db
        .select({
          date: sql<string>`to_char(date_trunc('day', ${tickets.createdAt}), 'YYYY-MM-DD')`,
          amountPiastres: sql<number>`coalesce(sum(${tickets.pricePaid}), 0)::int`,
        })
        .from(tickets)
        .where(
          and(
            gte(tickets.createdAt, thirtyDaysAgo),
            inArray(tickets.status, [...REVENUE_STATUSES]),
          ),
        )
        .groupBy(sql`date_trunc('day', ${tickets.createdAt})`)
        .orderBy(sql`date_trunc('day', ${tickets.createdAt})`),

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
        totalTickets,
        pendingReview: Number(pendingReviewRow[0]?.count ?? 0),
        confirmedTickets,
        checkedInTickets,
        totalRevenuePiastres: Number(revenueRow[0]?.total ?? 0),
        checkInRate,
      },
      ticketsByStatus: ticketStatusRows.map((row) => ({
        key: row.status,
        label: STATUS_LABELS[row.status] ?? row.status,
        count: Number(row.count),
      })),
      ticketsByType: ticketTypeRows.map((row) => ({
        key: row.type,
        label: TYPE_LABELS[row.type] ?? row.type,
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
