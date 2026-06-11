"use client";

import { formatPiastres } from "@/lib/pricing";
import { ColumnDef } from "@tanstack/react-table";
import { Coupon } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import CouponFormDialog from "../../Dialogs/coupon-form-dialog";

export const couponColumns: ColumnDef<Coupon>[] = [
  {
    accessorKey: "code",
    header: "Code",

    cell: ({ row }) => {
      const code = row.original.code;
      return (
        <div>
          <p className="font-mono font-semibold">{code}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type ",
    cell: ({ row }) => {
      const type = row.original.type;
      return <div className="capitalize">{type}</div>;
    },
  },
  {
    accessorKey: "discountAmount",
    header: () => "Value",
    cell: ({ row }) => {
      const type = row.original.type;
      const amount = row.original.discountAmount;
      return (
        <div>
          {type === "fixed"
            ? formatPiastres(amount)
            : `${row.original.percentageOff}%`}
        </div>
      );
    },
  },
  {
    accessorKey: "usedCount",
    header: "Uses",
    cell: ({ row }) => {
      const usedCount = row.original.usedCount;
      const maxUses = row.original.maxUses;

      return (
        <div>
          {usedCount}
          {maxUses ? ` / ${maxUses}` : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <CouponFormDialog coupon={row.original} />;
    },
  },
];
