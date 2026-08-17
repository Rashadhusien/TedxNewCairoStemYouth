"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/tables/data-table";
import { promoCodeColumns } from "@/components/admin/tables/promo-codes/columns";
import BulkFixedPriceDialog from "@/components/admin/Dialogs/bulk-fixed-price-dialog";
import { PROMO_CODE_STATUS } from "@/constants/select";
import { ROUTES } from "@/constants/routes";
import type { PromoCode } from "@/lib/db/schema";

type PromoCodeRow = PromoCode & {
  tags?: { id: string; name: string; slug: string; color: string | null }[];
  ticketCount?: number;
  packageCount?: number;
};

interface PromoCodeManagerProps {
  promoCodes: PromoCodeRow[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  tagIds: string;
  tags: { id: string; name: string }[];
}

export default function PromoCodeManager({
  promoCodes,
  total,
  page,
  pageSize,
  search,
  sortBy,
  tagIds,
  tags,
}: PromoCodeManagerProps) {
  const [selectedRows, setSelectedRows] = useState<PromoCodeRow[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const hasNonFixed = selectedRows.some((row) => row.type !== "fixed_price");

  const selectedIds = selectedRows.map((row) => row.id);

  return (
    <div className="space-y-4">
      <DataTable
        key={`${page}|${pageSize}|${search}|${sortBy}|${tagIds}|${resetKey}`}
        columns={promoCodeColumns}
        data={promoCodes}
        search={search}
        total={total}
        pageSize={pageSize}
        page={page}
        sortBy={sortBy}
        selectItems={PROMO_CODE_STATUS}
        tagItems={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
        selectedTagIds={tagIds}
        route={ROUTES.ADMIN.PROMO_CODES.HOME}
        enableRowSelection
        onSelectionChange={setSelectedRows}
      />

      {selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">
              Selected: {selectedRows.length}
            </p>
            {hasNonFixed && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Only fixed-price promo codes can be bulk-updated
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={hasNonFixed}
                onSelect={() => setBulkOpen(true)}
              >
                Change Fixed Price
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {bulkOpen && (
        <BulkFixedPriceDialog
          open
          onOpenChange={setBulkOpen}
          ids={selectedIds}
          onSuccess={() => {
            setSelectedRows([]);
            setResetKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}