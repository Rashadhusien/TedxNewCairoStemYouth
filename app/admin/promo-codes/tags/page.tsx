import TagFormDialog from "@/components/admin/Dialogs/tag-form-dialog";
import { tagColumns } from "@/components/admin/tables/tags/columns";
import { DataTable } from "@/components/admin/tables/data-table";
import { ROUTES } from "@/constants/routes";
import { listTags } from "@/lib/db/actions/tag.action";

export default async function AdminPromoCodeTagsPage() {
  const tags = await listTags();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Promo Code Tags</h1>
          <p className="text-muted-foreground text-sm">
            Tags help organize and filter promo codes by campaign or audience.
          </p>
        </div>
        <TagFormDialog />
      </div>

      <DataTable
        columns={tagColumns}
        data={tags}
        search=""
        total={tags.length}
        pageSize={tags.length || 10}
        page={1}
        status="all"
        selectItems={[]}
        route={ROUTES.ADMIN.PROMO_CODES.TAGS}
      />
    </div>
  );
}
