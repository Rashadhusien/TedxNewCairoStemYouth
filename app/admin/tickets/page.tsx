import { ticketColumns } from "@/components/admin/tables/tickets/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { TICKETS_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listTickets } from "@/lib/db/actions/ticket.action";

import { SearchParams } from "@/types";

interface AdminTicketsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminTicketsPage({
  searchParams,
}: AdminTicketsPageProps) {
  const params = await searchParams;

  const status = (params.status ?? "all") as
    | "all"
    | "pending_payment"
    | "payment_submitted"
    | "confirmed"
    | "rejected"
    | "checked_in"
    | "cancelled";

  const result = await listTickets({
    status,
    search: params.search,
    page: Number(params.page) || 1,
    pageSize: 10,
  });

  const data =
    result.success && result.data
      ? result.data
      : { items: [], total: 0, page: 1, pageSize: 10 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ticket Verification</h1>
        <p className="text-muted-foreground text-sm">
          Review payment proofs and approve or reject tickets.
        </p>
      </div>

      <DataTable
        columns={ticketColumns}
        data={data.items}
        search={params.search || ""}
        total={data.total}
        pageSize={data.pageSize}
        page={data.page}
        status={params.status ?? "all"}
        selectItems={TICKETS_STATUS}
        route={ROUTES.ADMIN.TICKETS}
      />
    </div>
  );
}
