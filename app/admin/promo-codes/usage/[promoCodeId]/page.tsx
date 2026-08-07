import { promoCodeUsageColumns } from "@/components/admin/tables/promo-code-usages/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { ROUTES } from "@/constants/routes";
import { getPromoCodeUsageHistory } from "@/lib/db/actions/promo-code.action";
import { getPromoCodeById } from "@/lib/db/actions/promo-code.action";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AdminPromoCodeUsagePageProps {
  params: Promise<{ promoCodeId: string }>;
}

export default async function AdminPromoCodeUsagePage({
  params,
}: AdminPromoCodeUsagePageProps) {
  const { promoCodeId } = await params;

  const promoCode = await getPromoCodeById(promoCodeId);
  if (!promoCode) {
    notFound();
  }

  const usageHistory = await getPromoCodeUsageHistory(promoCodeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN.PROMO_CODES.HOME}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Promo Code Usage History</h1>
          <p className="text-muted-foreground text-sm">
            {promoCode.code} - {promoCode.description || "No description"}
          </p>
        </div>
      </div>

      <DataTable
        columns={promoCodeUsageColumns}
        data={usageHistory}
        search=""
        total={usageHistory.length}
        pageSize={usageHistory.length}
        page={1}
        status="all"
        selectItems={[]}
        route={ROUTES.ADMIN.PROMO_CODES.HOME}
      />
    </div>
  );
}
