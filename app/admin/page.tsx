import { DashboardOverview } from "@/components/admin/dashboard/dashboard-overview";
import { getDashboardStats } from "@/lib/db/actions/dashboard.action";

const EMPTY_STATS = {
  overview: {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    totalOrders: 0,
    pendingPayment: 0,
    paidOrders: 0,
    totalTickets: 0,
    confirmedTickets: 0,
    checkedInTickets: 0,
    totalRevenuePiastres: 0,
    checkInRate: 0,
  },
  ordersByStatus: [],
  ordersByPackage: [],
  ticketsByStatus: [],
  registrationsByDay: [],
  revenueByDay: [],
  usersByRole: [],
  signupsByDay: [],
  coupons: { total: 0, active: 0, totalRedemptions: 0 },
  offers: { total: 0, active: 0, expiringSoon: 0 },
  sponsors: { total: 0, active: 0 },
  speakers: { total: 0, main: 0, keyholder: 0 },
};

export default async function AdminOverviewPage() {
  const result = await getDashboardStats();
  const stats = result.success && result.data ? result.data : EMPTY_STATS;

  return <DashboardOverview stats={stats} />;
}
