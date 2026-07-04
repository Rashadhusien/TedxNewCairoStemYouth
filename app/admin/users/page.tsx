import { DataTable } from "@/components/admin/tables/data-table";
import { usersColumns } from "@/components/admin/tables/users/columns";
import { USERS_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listUsers } from "@/lib/db/actions/user.action";
import { SearchParams } from "@/types";

interface AdminUsersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const status = (params.status ?? "all") as "all" | "active" | "inactive";

  const result = await listUsers({
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
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm">
          Manage user accounts and control whether they can access the platform.
        </p>
      </div>

      <DataTable
        columns={usersColumns}
        data={data.items}
        route={ROUTES.ADMIN.USERS}
        search={params.search || ""}
        total={data.total}
        pageSize={data.pageSize}
        page={data.page}
        status={params.status ?? "all"}
        selectItems={USERS_STATUS}
      />
    </div>
  );
}
