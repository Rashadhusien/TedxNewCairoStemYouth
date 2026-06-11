import OfferFormDialog from "@/components/admin/Dialogs/offer-form-dialog";
import { DataTable } from "@/components/admin/tables/data-table";
import { offerColumns } from "@/components/admin/tables/offers/page";
import { OFFERS_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import { listOffers } from "@/lib/db/actions/offer.action";
import { SearchParams } from "@/types";

interface AdminOffersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminOffersPage({
  searchParams,
}: AdminOffersPageProps) {
  const params = await searchParams;
  const status = (params.status ?? "all") as "all" | "active" | "inactive";

  const result = await listOffers({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 20,
    status,
    search: params.search,
  });

  const data =
    result.success && result.data
      ? result.data
      : { items: [], total: 0, page: 1, pageSize: 20 };

  console.log(data);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Offers</h1>
          <p className="text-muted-foreground text-sm">
            Manage promotional campaigns shown on the homepage and tickets page.
          </p>
        </div>
        <OfferFormDialog />
      </div>

      <DataTable
        data={data.items}
        columns={offerColumns}
        route={ROUTES.ADMIN.OFFERS}
        search={params.search || ""}
        total={data.total}
        pageSize={data.pageSize}
        page={data.page}
        status={params.status ?? "all"}
        selectItems={OFFERS_STATUS}
      />
    </div>
  );
}

{
  /* <AdminOffersClient items={data.items} /> */
}
