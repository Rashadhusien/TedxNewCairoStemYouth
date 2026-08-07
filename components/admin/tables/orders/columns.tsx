"use client";

import { Button } from "@/components/ui/button";
import { formatPiastres } from "@/lib/pricing";
import type { Order } from "@/lib/db/schema";
import { ArrowUpDown, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export const orderColumns = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }: any) => (
      <div className="font-mono text-sm">
        {row.getValue("id").slice(0, 8)}...
      </div>
    ),
  },
  {
    accessorKey: "packageName",
    header: "Package",
    cell: ({ row }: any) => (
      <div className="font-medium">{row.getValue("packageName")}</div>
    ),
  },
  {
    accessorKey: "packageTicketCount",
    header: "Tickets",
    cell: ({ row }: any) => <div>{row.getValue("packageTicketCount")}</div>,
  },
  {
    accessorKey: "originalAmountPiastres",
    header: "Original",
    cell: ({ row }: any) => (
      <div>{formatPiastres(row.getValue("originalAmountPiastres"))}</div>
    ),
  },
  {
    accessorKey: "discountPiastres",
    header: "Discount",
    cell: ({ row }: any) => {
      const discount = row.getValue("discountPiastres");
      return discount > 0 ? (
        <div className="text-green-600 dark:text-green-400">
          -{formatPiastres(discount)}
        </div>
      ) : (
        <div>—</div>
      );
    },
  },
  {
    accessorKey: "finalAmountPiastres",
    header: "Final",
    cell: ({ row }: any) => (
      <div className="font-medium">
        {formatPiastres(row.getValue("finalAmountPiastres"))}
      </div>
    ),
  },
  {
    accessorKey: "promoCode",
    header: "Promo",
    cell: ({ row }: any) => (
      <div className="font-mono text-sm">
        {row.getValue("promoCode") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "accessCode",
    header: "Access Code",
    cell: ({ row }: any) => (
      <div className="font-mono text-sm">
        {row.getValue("accessCode") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const statusStyles = {
        pending_payment:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        cancelled:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
      };
      const statusLabels = {
        pending_payment: "Pending",
        paid: "Paid",
        failed: "Failed",
        cancelled: "Cancelled",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusStyles[status as keyof typeof statusStyles]
          }`}
        >
          {statusLabels[status as keyof typeof statusLabels]}
        </span>
      );
    },
  },
  {
    accessorKey: "paymentReference",
    header: "Reference",
    cell: ({ row }: any) => (
      <div className="text-sm">{row.getValue("paymentReference") || "—"}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }: any) => (
      <div className="text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const order = row.original as Order;

      return (
        <div className="flex items-center gap-2">
          <Link href={ROUTES.ADMIN.ORDERS.DETAILS(order.id)}>
            <Button variant="ghost" size="icon" title="View Details">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {order.kashierSessionId && (
            <Button
              variant="ghost"
              size="icon"
              title="View in Kashier"
              onClick={() => {
                window.open(
                  `https://dashboard.kashier.io/checkout/${order.kashierSessionId}`,
                  "_blank",
                );
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
