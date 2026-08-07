import { orderColumns } from "@/components/admin/tables/orders/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { ORDER_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listOrders } from "@/lib/db/actions/order.action";
import { SearchParams } from "@/types";

interface AdminOrdersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;

  const status = (params.status ?? "all") as
    | "all"
    | "pending_payment"
    | "paid"
    | "failed"
    | "cancelled";

  const result = await listOrders({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    status,
    search: params.search,
  });

  const data =
    result.success && result.data ? result.data : { orders: [], total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Manage ticket package orders.
          </p>
        </div>
      </div>

      <DataTable
        columns={orderColumns}
        data={data.orders}
        search={params.search || ""}
        total={data.total}
        pageSize={Number(params.pageSize) || 10}
        page={Number(params.page) || 1}
        status={params.status ?? "all"}
        selectItems={ORDER_STATUS}
        route={ROUTES.ADMIN.ORDERS.HOME}
      />
    </div>
  );
}
