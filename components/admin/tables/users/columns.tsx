"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { AdminUserListItem } from "@/lib/db/actions/user.action";

import { UserStatusButton } from "./user-status-button";

function getDisplayName(user: AdminUserListItem) {
  return user.fullName ?? user.name ?? "Unnamed User";
}

export const usersColumns: ColumnDef<AdminUserListItem>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="min-w-0">
          <div className="font-medium">{getDisplayName(user)}</div>
          <div className="text-muted-foreground text-xs">{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;

      return (
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.phone ?? "—"}</div>;
    },
  },
  {
    accessorKey: "university",
    header: "University",
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.university ?? "—"}</div>;
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
    cell: ({ row }) => {
      const isVerified = !!row.original.emailVerified;

      return (
        <Badge variant={isVerified ? "default" : "secondary"}>
          {isVerified ? "Verified" : "Pending"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(new Date(row.original.createdAt))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <UserStatusButton
          userId={row.original.id}
          isActive={row.original.isActive}
        />
      );
    },
  },
];
