import TicketLimitForm from "@/components/admin/ticket-limit-form";
import { getTicketLimitSetting } from "@/lib/db/actions/setting.action";

export default async function AdminTicketLimitPage() {
  const limit = await getTicketLimitSetting();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ticket Limit</h1>
        <p className="text-muted-foreground text-sm">
          Set the maximum total number of confirmed tickets that can be sold
          across all packages.
        </p>
      </div>

      <TicketLimitForm
        maxTotalTickets={limit.maxTotalTickets}
        totalTicketsSold={limit.totalTicketsSold}
        remainingTickets={limit.remainingTickets}
      />
    </div>
  );
}
