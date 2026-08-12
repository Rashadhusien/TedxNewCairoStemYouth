import { auditLogColumns } from "@/components/admin/tables/audit-logs/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { AUDIT_CATEGORY_FILTERS, AUDIT_STATUS_FILTERS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listAuditLogs } from "@/lib/db/actions/audit.action";
import { SearchParams } from "@/types";

interface AdminActivityLogsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminActivityLogsPage({
  searchParams,
}: AdminActivityLogsPageProps) {
  const params = await searchParams;

  const result = await listAuditLogs({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 20,
    category: params.category ?? "all",
    status: params.status ?? "all",
    search: params.search,
    from: (params as Record<string, string>).from,
    to: (params as Record<string, string>).to,
  });

  const data = result.success && result.data ? result.data : { items: [], total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground text-sm">
            Audit trail of admin actions, orders, payments, check-ins, promo codes and emails.
          </p>
        </div>
      </div>

      <DataTable
        columns={auditLogColumns}
        data={data.items}
        search={params.search || ""}
        total={data.total}
        pageSize={Number(params.pageSize) || 20}
        page={Number(params.page) || 1}
        status={params.status ?? "all"}
        selectItems={AUDIT_STATUS_FILTERS}
        category={params.category ?? "all"}
        categoryItems={AUDIT_CATEGORY_FILTERS}
        route={ROUTES.ADMIN.ACTIVITY_LOGS}
      />
    </div>
  );
}