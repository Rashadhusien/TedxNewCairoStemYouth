"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { formatPiastres } from "@/lib/pricing";
import type { Package } from "@/lib/db/schema";
import { ToggleLeft, ToggleRight, Trash2, Edit } from "lucide-react";
import {
  deletePackage,
  togglePackageActive,
} from "@/lib/db/actions/package.action";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import PackageFormDialog from "@/components/admin/Dialogs/package-form-dialog";

export const packageColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div className="font-medium">{row.getValue("name") as string}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div className="text-sm text-muted-foreground max-w-xs truncate">
        {(row.getValue("description") as string) || "—"}
      </div>
    ),
  },
  {
    accessorKey: "ticketCount",
    header: "Tickets",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>{row.getValue("ticketCount") as number}</div>
    ),
  },
  {
    accessorKey: "pricePerTicketPiastres",
    header: "Price/Ticket",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>
        {formatPiastres(row.getValue("pricePerTicketPiastres") as number)}
      </div>
    ),
  },
  {
    accessorKey: "totalPricePiastres",
    header: "Total Price",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div className="font-medium">
        {formatPiastres(row.getValue("totalPricePiastres") as number)}
      </div>
    ),
  },
  {
    accessorKey: "requiresAccessCode",
    header: "Access Code",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>
        {(row.getValue("requiresAccessCode") as boolean) ? "Yes" : "No"}
      </div>
    ),
  },
  {
    accessorKey: "isPromoApplicable",
    header: "Promo Applicable",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>{(row.getValue("isPromoApplicable") as boolean) ? "Yes" : "No"}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            (row.getValue("isActive") as boolean)
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          }`}
        >
          {(row.getValue("isActive") as boolean) ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Package } }) => {
      const pkg = row.original;

      return (
        <div className="flex items-center gap-2">
          <PackageFormDialog
            package={pkg}
            trigger={
              <Button variant="ghost" size="icon" title="Edit">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
          <ConfirmDialog
            title={`${pkg.isActive ? "Deactivate" : "Activate"} Package`}
            description={`Are you sure you want to ${pkg.isActive ? "deactivate" : "activate"} this package?`}
            onConfirm={async () => {
              await togglePackageActive(pkg.id);
            }}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                title={pkg.isActive ? "Deactivate" : "Activate"}
              >
                {pkg.isActive ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
              </Button>
            }
          />
          <ConfirmDialog
            title="Delete Package"
            description="Are you sure you want to delete this package? This action cannot be undone."
            onConfirm={async () => {
              await deletePackage(pkg.id);
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
