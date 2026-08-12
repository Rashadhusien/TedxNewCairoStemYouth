"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryStyles: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  order: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  payment:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
  ticket:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  promo_code:
    "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
  email: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  auth: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
};

const categoryLabels: Record<string, string> = {
  admin: "Admin",
  order: "Order",
  payment: "Payment",
  ticket: "Ticket",
  promo_code: "Promo",
  email: "Email",
  auth: "Auth",
};

const statusStyles: Record<string, string> = {
  success:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  failure: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  info: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export const auditLogColumns = [
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }: any) => (
      <div className="text-sm whitespace-nowrap">
        {new Date(row.getValue("createdAt")).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "actor",
    header: "Actor",
    cell: ({ row }: any) => {
      const log = row.original;
      const name = log.actorName ?? log.actorEmail ?? null;
      return (
        <div>
          {name ? (
            <>
              <div className="text-sm font-medium">{name}</div>
              {log.actorEmail && log.actorName ? (
                <div className="text-xs text-muted-foreground">
                  {log.actorEmail}
                </div>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">System</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: any) => {
      const category = row.getValue("category") as string;
      return (
        <Badge variant="secondary" className={cn(categoryStyles[category])}>
          {categoryLabels[category] ?? category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }: any) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.getValue("action")}
      </div>
    ),
  },
  {
    accessorKey: "summary",
    header: "Summary",
    cell: ({ row }: any) => (
      <div className="text-sm max-w-md truncate">{row.getValue("summary")}</div>
    ),
  },
  {
    accessorKey: "entityType",
    header: "Entity",
    cell: ({ row }: any) => {
      const log = row.original;
      return (
        <div className="text-xs">
          <span className="text-muted-foreground">{log.entityType}</span>
          {log.entityId && (
            <div className="font-mono text-muted-foreground/80 max-w-[140px] truncate">
              {log.entityId}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusStyles[status] ?? statusStyles.info,
          )}
        >
          {status}
        </span>
      );
    },
  },
];