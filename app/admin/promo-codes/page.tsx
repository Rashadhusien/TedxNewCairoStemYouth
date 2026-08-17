import PromoCodeFormDialog from "@/components/admin/Dialogs/promo-code-form-dialog";
import PromoCodeManager from "@/components/admin/promo-code-manager";
import { listPromoCodes } from "@/lib/db/actions/promo-code.action";
import { listTags } from "@/lib/db/actions/tag.action";
import { SearchParams } from "@/types";

interface AdminPromoCodesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminPromoCodesPage({
  searchParams,
}: AdminPromoCodesPageProps) {
  const params = await searchParams;

  const sortBy = (params.sortBy ?? "recent") as "most_used" | "recent";
  const tagIds = params.tagIds ? params.tagIds.split(",") : undefined;

  const result = await listPromoCodes({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    sortBy,
    search: params.search,
    tagIds,
  });

  const data =
    result.success && result.data ? result.data : { promoCodes: [], total: 0 };

  const tags = await listTags();

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

      <PromoCodeManager
        promoCodes={data.promoCodes}
        total={data.total}
        page={Number(params.page) || 1}
        pageSize={Number(params.pageSize) || 10}
        search={params.search || ""}
        sortBy={params.sortBy ?? "recent"}
        tagIds={tagIds?.join(",") || ""}
        tags={tags}
      />
    </div>
  );
}
