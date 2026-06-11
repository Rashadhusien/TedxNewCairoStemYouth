"use client";

import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import { Button } from "@/components/ui/button";
import { formatPiastres } from "@/lib/pricing";
import { MyTicketData, TicketWithRelations } from "@/types/ticket";
import { ColumnDef } from "@tanstack/react-table";
import { div } from "framer-motion/client";
import { ReactNode } from "react";
import TicketReviewDialog from "../../Dialogs/ticket-review-dialog";

export const ticketColumns: ColumnDef<TicketWithRelations>[] = [
  {
    accessorKey: "user.fullName",
    header: "Attendee",

    cell: ({ row }) => {
      const name = row.original.user?.fullName;
      const email = row.original.user?.email;
      return (
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tier",
    cell: ({ row }) => {
      const type = row.original.type;
      return <div className="uppercase">{type}</div>;
    },
  },
  {
    accessorKey: "pricePaid",
    header: () => "Amount",
    cell: ({ row }) => {
      const amount = formatPiastres(row.getValue("pricePaid"));
      return <div className="font-medium">{amount}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return <TicketStatusBadge status={status} />;
    },
  },
  {
    accessorKey: "paymentSubmittedAt",
    header: "Submitted",
    cell: ({ row }) => {
      const sub = row.original.paymentSubmittedAt;
      const submitted = sub ? new Date(sub).toLocaleDateString() : "—";

      return <div>{submitted}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <TicketReviewDialog ticket={row.original} />;
    },
  },
];
