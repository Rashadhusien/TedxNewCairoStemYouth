"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { Speaker } from "@/lib/db/schema";

export const speakersColumns: ColumnDef<Speaker>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const name = row.original.name;
      const imageUrl = row.original.imageUrl;
      return (
        <Avatar className="size-10">
          <AvatarImage src={imageUrl || ""} alt={name} />
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
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return <div className="text-sm text-muted-foreground">{role}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant={type === "main" ? "default" : "secondary"}>
          {type === "main" ? "Main Speaker" : "Keyholder"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <div className="max-w-xs truncate line-clamp-2 text-sm text-muted-foreground">
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "displayOrder",
    header: "Order",
    cell: ({ row }) => {
      const displayOrder = row.original.displayOrder;
      return <div className="text-sm">{displayOrder}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.isActive;
      return (
        <Badge variant={active ? "default" : "destructive"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.ADMIN.SPEAKERS.EDIT(row.original.id)}>Edit</Link>
        </Button>
      );
    },
  },
];
