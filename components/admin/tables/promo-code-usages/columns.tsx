"use client";

import { formatPiastres } from "@/lib/pricing";

export const promoCodeUsageColumns = [
  {
    accessorKey: "usedAt",
    header: "Date",
    cell: ({ row }: any) => {
      const usedAt = row.getValue("usedAt");
      return (
        <div className="text-sm">
          {new Date(usedAt).toLocaleDateString()}{" "}
          {new Date(usedAt).toLocaleTimeString()}
        </div>
      );
    },
  },
  {
    accessorKey: "order.packageName",
    header: "Package",
    cell: ({ row }: any) => <div>{row.original.order?.packageName || "—"}</div>,
  },
  {
    accessorKey: "order.packageTicketCount",
    header: "Tickets",
    cell: ({ row }: any) => (
      <div>{row.original.order?.packageTicketCount || "—"}</div>
    ),
  },
  {
    accessorKey: "usage.originalAmountPiastres",
    header: "Original",
    cell: ({ row }: any) => (
      <div>{formatPiastres(row.original.usage?.originalAmountPiastres)}</div>
    ),
  },
  {
    accessorKey: "usage.discountPiastres",
    header: "Discount",
    cell: ({ row }: any) => (
      <div className="text-green-600 dark:text-green-400">
        -{formatPiastres(row.original.usage?.discountPiastres)}
      </div>
    ),
  },
  {
    accessorKey: "usage.finalAmountPiastres",
    header: "Final",
    cell: ({ row }: any) => (
      <div className="font-medium">
        {formatPiastres(row.original.usage?.finalAmountPiastres)}
      </div>
    ),
  },
];
