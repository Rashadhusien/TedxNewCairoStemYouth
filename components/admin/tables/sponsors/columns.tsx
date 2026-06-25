"use client";

import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import { formatPiastres } from "@/lib/pricing";
import { ColumnDef } from "@tanstack/react-table";
import TicketReviewDialog from "../../Dialogs/ticket-review-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SponsorsWithRelations } from "@/types/sponsor";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const sponsorsColumns: ColumnDef<SponsorsWithRelations>[] = [
  {
    accessorKey: "logoUrl",
    header: "Logo",

    cell: ({ row }) => {
      const name = row.original.name;
      const logoUrl = row.original.logoUrl;
      return (
        <Avatar>
          <AvatarImage src={logoUrl || ""} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name;
      const website = row.original.website;
      return (
        <div className="capitalize ">
          {website ? (
            <Link
              href={website || ""}
              target="_blank"
              rel="noopener noreferrer hover:underline hover:text-primary"
            >
              {name}
            </Link>
          ) : (
            <span>{name}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <div className="font-medium max-w-xs truncate line-clamp-2">
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => {
      const tier = row.original.tier;

      return <div className="capitalize">{tier}</div>;
    },
  },
  {
    accessorKey: "leadGenQuestions",
    header: "Questions",
    cell: ({ row }) => {
      const questions = row.original.leadGenQuestions;
      const questionCount = questions?.length || 0;

      return <div className="capitalize">{questionCount}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const status = type === "sponsor" ? "Sponsor" : "Partner";

      return (
        <Badge variant={type === "sponsor" ? "outline" : "secondary"}>
          {status}
        </Badge>
      );
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
          <Link href={ROUTES.ADMIN.SPONSORS.EDIT(row.original.id)}>Edit</Link>
        </Button>
      );
    },
  },
];
