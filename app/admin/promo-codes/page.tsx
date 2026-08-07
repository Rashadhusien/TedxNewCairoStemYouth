import PromoCodeFormDialog from "@/components/admin/Dialogs/promo-code-form-dialog";
import { promoCodeColumns } from "@/components/admin/tables/promo-codes/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { PROMO_CODE_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listPromoCodes } from "@/lib/db/actions/promo-code.action";
import { SearchParams } from "@/types";

interface AdminPromoCodesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminPromoCodesPage({
  searchParams,
}: AdminPromoCodesPageProps) {
  const params = await searchParams;

  const status = (params.status ?? "all") as "all" | "active" | "inactive";

  const result = await listPromoCodes({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    status,
    search: params.search,
  });

  const data =
    result.success && result.data ? result.data : { promoCodes: [], total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground text-sm">
            Manage promotional codes for ticket discounts.
          </p>
        </div>
        <PromoCodeFormDialog />
      </div>

      <DataTable
        columns={promoCodeColumns}
        data={data.promoCodes}
        search={params.search || ""}
        total={data.total}
        pageSize={Number(params.pageSize) || 10}
        page={Number(params.page) || 1}
        status={params.status ?? "all"}
        selectItems={PROMO_CODE_STATUS}
        route={ROUTES.ADMIN.PROMO_CODES.HOME}
      />
    </div>
  );
}
