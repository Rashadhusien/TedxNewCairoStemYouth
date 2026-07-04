import { DataTable } from "@/components/admin/tables/data-table";
import { sponsorsColumns } from "@/components/admin/tables/sponsors/columns";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SPONSOR_STATUS } from "@/constants/select";
import { listSponsors } from "@/lib/db/actions/sponsor.action";
import { SearchParams } from "@/types";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AdminSponsorsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminSponsorsPage({
  searchParams,
}: AdminSponsorsPageProps) {
  const params = await searchParams;
  const status = (params.status ?? "all") as "all" | "active" | "inactive";

  const result = await listSponsors({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    status,
    search: params.search,
  });

  const data =
    result.success && result.data
      ? result.data
      : { items: [], total: 0, page: 1, pageSize: 10 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sponsors</h1>
          <p className="text-muted-foreground text-sm">
            Manage sponsors and their details.
          </p>
        </div>
        <Button className="flex items-center gap-2" asChild size={"lg"}>
          <Link href={ROUTES.ADMIN.SPONSORS.CREATE}>
            <Plus className="size-4" />
            Add Sponsor
          </Link>
        </Button>
      </div>

      <DataTable
        data={data.items}
        columns={sponsorsColumns}
        route={ROUTES.ADMIN.SPONSORS.HOME}
        search={params.search || ""}
        total={data.total}
        pageSize={data.pageSize}
        page={data.page}
        status={params.status ?? "all"}
        selectItems={SPONSOR_STATUS}
      />
    </div>
  );
}

{
  /* <AdminOffersClient items={data.items} /> */
}
