import CouponFormDialog from "@/components/admin/Dialogs/coupon-form-dialog";
import { couponColumns } from "@/components/admin/tables/coupons/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { COUPONS_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listCoupons } from "@/lib/db/actions/coupon.action";
import { SearchParams } from "@/types";

interface AdminCouponsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminCouponsPage({
  searchParams,
}: AdminCouponsPageProps) {
  const params = await searchParams;

  const status = (params.status ?? "all") as "all" | "active" | "inactive";

  const result = await listCoupons({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
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
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground text-sm">
            Manage discount codes for ticket checkout.
          </p>
        </div>
        <CouponFormDialog />
      </div>

      <DataTable
        columns={couponColumns}
        data={data.items}
        search={params.search || ""}
        total={data.total}
        pageSize={data.pageSize}
        page={data.page}
        status={params.status ?? "all"}
        selectItems={COUPONS_STATUS}
        route={ROUTES.ADMIN.COUPONS.HOME}
      />
    </div>
  );
}
