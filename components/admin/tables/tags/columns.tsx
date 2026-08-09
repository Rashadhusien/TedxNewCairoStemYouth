"use client";

import { Button } from "@/components/ui/button";
import type { Tag } from "@/lib/db/schema";
import { Trash2, Edit } from "lucide-react";
import { deleteTag } from "@/lib/db/actions/tag.action";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import TagFormDialog from "@/components/admin/Dialogs/tag-form-dialog";

export const tagColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => {
      const tag = row.original as Tag & { promoCodeCount?: number };
      return (
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: tag.color || "#3b82f6" }}
          />
          <span className="font-medium">{tag.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }: any) => (
      <div className="text-sm text-muted-foreground font-mono">
        {row.getValue("slug")}
      </div>
    ),
  },
  {
    accessorKey: "promoCodeCount",
    header: "Promo Codes",
    cell: ({ row }: any) => <div>{row.getValue("promoCodeCount") || 0}</div>,
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const tag = row.original as Tag;

      return (
        <div className="flex items-center gap-2">
          <TagFormDialog
            tag={tag}
            trigger={
              <Button variant="ghost" size="icon" title="Edit">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
          <ConfirmDialog
            title="Delete Tag"
            description="Are you sure you want to delete this tag? It will be removed from all linked promo codes, but the promo codes themselves will not be affected."
            onConfirm={async () => {
              await deleteTag(tag.id);
            }}
            confirmText="Delete"
            variant="destructive"
            trigger={
              <Button variant="ghost" size="icon" title="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      );
    },
  },
];
