import { DataTable } from "@/components/admin/tables/data-table";
import { ticketTiersColumns } from "@/components/admin/tables/ticket-tiers/columns";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { TICKET_TIERS_STATUS } from "@/constants/select";
import { listTicketTiers } from "@/lib/db/actions/ticket-tier.action";
import { SearchParams } from "@/types";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AdminTicketTiersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminTicketTiersPage({
  searchParams,
}: AdminTicketTiersPageProps) {
  const params = await searchParams;
  const status = (params.status ?? "all") as "all" | "active" | "inactive";

  const result = await listTicketTiers({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 20,
    status,
    search: params.search,
  });

  const data =
    result.success && result.data
      ? result.data
      : { items: [], total: 0, page: 1, pageSize: 20 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Ticket Tiers</h1>
          <p className="text-muted-foreground text-sm">
            Manage ticket tiers and their pricing.
          </p>
        </div>
        <Button className="flex items-center gap-2" asChild size={"lg"}>
          <Link href={ROUTES.ADMIN.TICKET_TIERS.CREATE}>
            <Plus className="size-4" />
            Add Ticket Tier
          </Link>
        </Button>
      </div>

      <DataTable
        data={data.items}
        columns={ticketTiersColumns}
        route={ROUTES.ADMIN.TICKET_TIERS.HOME}
        search={params.search || ""}
        total={data.total}
        pageSize={data.pageSize}
        page={data.page}
        status={params.status ?? "all"}
        selectItems={TICKET_TIERS_STATUS}
      />
    </div>
  );
}
