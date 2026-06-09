import AdminTicketsClient from "@/components/admin/admin-tickets-client";
import { ticketColumns } from "@/components/admin/tables/tickets/columns";
import { DataTable } from "@/components/admin/tables/tickets/data-table";
import { listTickets } from "@/lib/db/actions/ticket.action";

interface AdminTicketsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
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
    pageSize: 20,
  });

  const data =
    result.success && result.data
      ? result.data
      : { items: [], total: 0, page: 1, pageSize: 20 };

  console.log(data);

  return <DataTable columns={ticketColumns} data={data.items} />;
}
{
  /* <AdminTicketsClient
items={data.items}
total={data.total}
page={data.page}
pageSize={data.pageSize}
status={params.status ?? "payment_submitted"}
search={params.search ?? ""}
/> */
}
