import PackageFormDialog from "@/components/admin/Dialogs/package-form-dialog";
import { packageColumns } from "@/components/admin/tables/packages/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { PACKAGE_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listPackages } from "@/lib/db/actions/package.action";
import { SearchParams } from "@/types";

interface AdminPackagesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminPackagesPage({
  searchParams,
}: AdminPackagesPageProps) {
  const params = await searchParams;

  const status = (params.status ?? "all") as "all" | "active" | "inactive";

  const result = await listPackages({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    status,
    search: params.search,
  });

  const data =
    result.success && result.data ? result.data : { packages: [], total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Packages</h1>
          <p className="text-muted-foreground text-sm">
            Manage ticket packages and pricing.
          </p>
        </div>
        <PackageFormDialog />
      </div>

      <DataTable
        columns={packageColumns}
        data={data.packages}
        search={params.search || ""}
        total={data.total}
        pageSize={Number(params.pageSize) || 10}
        page={Number(params.page) || 1}
        status={params.status ?? "all"}
        selectItems={PACKAGE_STATUS}
        route={ROUTES.ADMIN.PACKAGES.HOME}
      />
    </div>
  );
}
