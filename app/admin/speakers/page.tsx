import { DataTable } from "@/components/admin/tables/data-table";
import { speakersColumns } from "@/components/admin/tables/speakers/columns";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SPEAKER_STATUS } from "@/constants/select";
import { listSpeakers } from "@/lib/db/actions/speaker.action";
import { SearchParams } from "@/types";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AdminSpeakersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminSpeakersPage({
  searchParams,
}: AdminSpeakersPageProps) {
  const params = await searchParams;
  const status = (params.status ?? "all") as "all" | "active" | "inactive";
  const type = (params.type ?? "all") as "all" | "main" | "keyholder";

  const result = await listSpeakers({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 20,
    status,
    type,
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
          <h1 className="text-2xl font-bold">Speakers</h1>
          <p className="text-muted-foreground text-sm">
            Manage speakers and keyholders.
          </p>
        </div>
        <Button className="flex items-center gap-2" asChild size={"lg"}>
          <Link href={ROUTES.ADMIN.SPEAKERS.CREATE}>
            <Plus className="size-4" />
            Add Speaker
          </Link>
        </Button>
      </div>

      <DataTable
        data={data.items}
        columns={speakersColumns}
        route={ROUTES.ADMIN.SPEAKERS.HOME}
        search={params.search || ""}
        total={data.total}
        pageSize={data.pageSize}
        page={data.page}
        status={params.status ?? "all"}
        selectItems={SPEAKER_STATUS}
      />
    </div>
  );
}
