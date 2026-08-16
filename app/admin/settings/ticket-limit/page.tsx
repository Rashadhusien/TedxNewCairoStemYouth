import TicketLimitForm from "@/components/admin/ticket-limit-form";
import {
  getTicketLimitSetting,
  getTicketStatistics,
} from "@/lib/db/actions/setting.action";
import TicketStatisticsChart from "./ticket-statistics-chart";

export default async function AdminTicketLimitPage() {
  const limit = await getTicketLimitSetting();
  const stats = await getTicketStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ticket Limit & Statistics</h1>
        <p className="text-muted-foreground text-sm">
          Set the maximum total number of confirmed tickets that can be sold
          across all packages and view detailed sales statistics.
        </p>
      </div>

      <TicketLimitForm
        maxTotalTickets={limit.maxTotalTickets}
        totalTicketsSold={limit.totalTicketsSold}
        remainingTickets={limit.remainingTickets}
      />

      <TicketStatisticsChart stats={stats} />
    </div>
  );
}
