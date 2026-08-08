import {
  Camera,
  Layers,
  Percent,
  ReceiptText,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
  Users2,
} from "lucide-react";

import { DashboardCharts } from "@/components/admin/dashboard/dashboard-charts";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { DashboardStats } from "@/lib/db/actions/dashboard.action";
import { formatPiastres } from "@/lib/pricing";

type DashboardOverviewProps = {
  stats: DashboardStats;
};

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const { overview } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Event metrics, ticket sales, and platform activity at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPiastres(overview.totalRevenuePiastres)}
          description="From paid orders"
          icon={TrendingUp}
        />
        <StatCard
          title="Pending Payment"
          value={overview.pendingPayment}
          description="Orders awaiting payment"
          icon={ReceiptText}
          href={`${ROUTES.ADMIN.TICKETS}?status=pending_payment`}
          trend={
            overview.pendingPayment > 0
              ? { label: "Action required", positive: false }
              : undefined
          }
        />
        <StatCard
          title="Paid Orders"
          value={overview.paidOrders}
          description="Completed purchases"
          icon={UserCheck}
          href={`${ROUTES.ADMIN.TICKETS}?status=paid`}
        />
        <StatCard
          title="Checked In"
          value={overview.checkedInTickets}
          description={`${overview.checkInRate}% of eligible attendees`}
          icon={Camera}
          href={ROUTES.ADMIN.CHECK_IN}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={overview.totalUsers}
          description={`${overview.activeUsers} active accounts`}
          icon={Users}
          href={ROUTES.ADMIN.USERS}
        />
        <StatCard
          title="New Users (7d)"
          value={overview.newUsersThisWeek}
          description="Registrations this week"
          icon={Users}
          trend={
            overview.newUsersThisWeek > 0
              ? { label: "Growing this week", positive: true }
              : undefined
          }
        />
        <StatCard
          title="Total Orders"
          value={overview.totalOrders}
          description="All package orders"
          icon={ReceiptText}
          href={ROUTES.ADMIN.TICKETS}
        />
        <StatCard
          title="Coupon Redemptions"
          value={stats.coupons.totalRedemptions}
          description={`${stats.coupons.active} active coupons`}
          icon={Percent}
          href={ROUTES.ADMIN.COUPONS.HOME}
        />
      </div>

      <DashboardCharts stats={stats} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Tag className="size-4" />
              Offers
            </CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {stats.offers.active}
              <span className="text-muted-foreground text-sm font-normal">
                {" "}
                / {stats.offers.total} active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              {stats.offers.expiringSoon > 0
                ? `${stats.offers.expiringSoon} expiring within 7 days`
                : "No offers expiring soon"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Layers className="size-4" />
              Sponsors
            </CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {stats.sponsors.active}
              <span className="text-muted-foreground text-sm font-normal">
                {" "}
                / {stats.sponsors.total} active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              Partner and sponsor accounts on the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users2 className="size-4" />
              Speakers
            </CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {stats.speakers.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              {stats.speakers.main} main · {stats.speakers.keyholder} keyholders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Percent className="size-4" />
              Coupons
            </CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {stats.coupons.total}
              <span className="text-muted-foreground text-sm font-normal">
                {" "}
                total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              {stats.coupons.totalRedemptions.toLocaleString()} total
              redemptions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
