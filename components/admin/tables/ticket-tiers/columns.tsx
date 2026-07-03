"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { TicketTier } from "@/lib/db/schema";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatPiastres } from "@/lib/pricing";

export const ticketTiersColumns: ColumnDef<TicketTier>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const typeLabels: Record<string, string> = {
        vip: "VIP",
        ip: "IP",
        np: "NP",
      };

      return (
        <Badge variant="outline" className="font-semibold">
          {typeLabels[type] || type.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) => {
      const label = row.original.label;
      return <div className="font-medium">{label}</div>;
    },
  },
  {
    accessorKey: "subtitle",
    header: "Subtitle",
    cell: ({ row }) => {
      const subtitle = row.original.subtitle;
      return <div className="text-muted-foreground">{subtitle}</div>;
    },
  },
  {
    accessorKey: "pricePiastres",
    header: "Price",
    cell: ({ row }) => {
      const pricePiastres = row.original.pricePiastres;
      return <div className="font-medium">{formatPiastres(pricePiastres)}</div>;
    },
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => {
      const features = row.original.features;
      const featureCount = features?.length || 0;

      return <div className="text-muted-foreground">{featureCount} features</div>;
    },
  },
  {
    accessorKey: "displayOrder",
    header: "Order",
    cell: ({ row }) => {
      const displayOrder = row.original.displayOrder;
      return <div className="text-muted-foreground">{displayOrder}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.isActive;
      const status = active ? "Active" : "Inactive";

      return (
        <Badge variant={active ? "default" : "destructive"}>{status}</Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button variant="outline" asChild>
          <Link href={ROUTES.ADMIN.TICKET_TIERS.EDIT(row.original.id)}>Edit</Link>
        </Button>
      );
    },
  },
];
