"use client";

import { Button } from "@/components/ui/button";
import { formatPiastres } from "@/lib/pricing";
import type { PromoCode } from "@/lib/db/schema";
import { ToggleLeft, ToggleRight, Trash2, Eye, Edit } from "lucide-react";
import {
  togglePromoCodeActive,
  softDeletePromoCode,
} from "@/lib/db/actions/promo-code.action";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import PromoCodeFormDialog from "@/components/admin/Dialogs/promo-code-form-dialog";

export const promoCodeColumns = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }: any) => (
      <div className="font-medium font-mono">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }: any) => (
      <div className="text-sm">{row.getValue("owner") || "—"}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: any) => {
      const type = row.getValue("type");
      const typeLabels = {
        fixed_price: "Fixed Price",
        discount: "Discount",
        free: "Free",
      };
      return <div>{typeLabels[type as keyof typeof typeLabels]}</div>;
    },
  },
  {
    accessorKey: "valuePiastres",
    header: "Value",
    cell: ({ row }: any) => {
      const type = row.getValue("type");
      const value = row.getValue("valuePiastres");

      if (type === "free") return <div>Free</div>;
      if (type === "fixed_price") return <div>{formatPiastres(value)}</div>;
      if (type === "discount") return <div>{formatPiastres(value)} off</div>;
      return <div>—</div>;
    },
  },
  {
    accessorKey: "maxUses",
    header: "Max Uses",
    cell: ({ row }: any) => <div>{row.getValue("maxUses") || "Unlimited"}</div>,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }: any) => {
      const tags = row.getValue("tags") as
        | { id: string; name: string; color: string | null }[]
        | undefined;
      if (!tags || tags.length === 0) return <div className="text-sm">—</div>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: tag.color ? `${tag.color}1a` : undefined,
                borderColor: tag.color
                  ? `${tag.color}40`
                  : undefined,
                color: tag.color ?? undefined,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "usedCount",
    header: "Used",
    cell: ({ row }: any) => <div>{row.getValue("usedCount")}</div>,
  },
  {
    accessorKey: "packageCount",
    header: "Packages",
    cell: ({ row }: any) => (
      <div className="text-sm">{row.getValue("packageCount") ?? 0}</div>
    ),
  },
  {
    accessorKey: "ticketCount",
    header: "Tickets",
    cell: ({ row }: any) => (
      <div className="text-sm">{row.getValue("ticketCount") ?? 0}</div>
    ),
  },
  {
    accessorKey: "remaining",
    header: "Remaining",
    cell: ({ row }: any) => {
      const maxUses = row.getValue("maxUses");
      const usedCount = row.getValue("usedCount");
      if (!maxUses) return <div>Unlimited</div>;
      return <div>{Math.max(0, maxUses - usedCount)}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.getValue("isActive")
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          }`}
        >
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "validUntil",
    header: "Expires",
    cell: ({ row }: any) => {
      const validUntil = row.getValue("validUntil");
      if (!validUntil) return <div>No expiry</div>;
      return (
        <div className="text-sm">
          {new Date(validUntil).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const promoCode = row.original as PromoCode & {
        tags?: { id: string; name: string; slug: string; color: string | null }[];
      };

      return (
        <div className="flex items-center gap-2">
          <PromoCodeFormDialog
            promoCode={promoCode}
            trigger={
              <Button variant="ghost" size="icon" title="Edit">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
          <Link href={ROUTES.ADMIN.PROMO_CODES.USAGE(promoCode.id)}>
            <Button variant="ghost" size="icon" title="View Usage">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <ConfirmDialog
            title={`${promoCode.isActive ? "Deactivate" : "Activate"} Promo Code`}
            description={`Are you sure you want to ${promoCode.isActive ? "deactivate" : "activate"} this promo code?`}
            onConfirm={async () => {
              await togglePromoCodeActive(promoCode.id);
            }}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                title={promoCode.isActive ? "Deactivate" : "Activate"}
              >
                {promoCode.isActive ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
              </Button>
            }
          />
          <ConfirmDialog
            title="Delete Promo Code"
            description="Are you sure you want to delete this promo code? This action cannot be undone."
            onConfirm={async () => {
              await softDeletePromoCode(promoCode.id);
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
