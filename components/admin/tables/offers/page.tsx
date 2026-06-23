"use client";

import { formatPiastres } from "@/lib/pricing";
import { ColumnDef } from "@tanstack/react-table";
import { Offer } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import CouponFormDialog from "../../Dialogs/coupon-form-dialog";
import { Infinity } from "lucide-react";
import OfferFormDialog from "../../Dialogs/offer-form-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export const offerColumns: ColumnDef<Offer>[] = [
  {
    accessorKey: "title",
    header: "Title",

    cell: ({ row }) => {
      const title = row.original.title;
      return (
        <div>
          <p className="font-semibold">{title}</p>
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
    accessorKey: "discountedPrice",
    header: () => "Price",
    cell: ({ row }) => {
      const amount = row.original.discountedPrice;
      return <div> {amount !== null ? formatPiastres(amount) : "—"}</div>;
    },
  },
  {
    accessorKey: "remainingSlots",
    header: "Uses",
    cell: ({ row }) => {
      const remainingSlots = row.original.remainingSlots;

      return <div>{remainingSlots ?? <Infinity className="size-4" />}</div>;
    },
  },
  {
    accessorKey: "startsAt",
    header: "Starts At",
    cell: ({ row }) => {
      const startsAt = row.original.startsAt;

      return (
        <div>{startsAt ? new Date(startsAt).toLocaleDateString() : "—"}</div>
      );
    },
  },
  {
    accessorKey: "endsAt",
    header: "Ends At",
    cell: ({ row }) => {
      const endsAt = row.original.endsAt;

      return <div>{endsAt ? new Date(endsAt).toLocaleDateString() : "—"}</div>;
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
      return (
        <Button variant="outline" asChild>
          <Link href={ROUTES.ADMIN.OFFERS.EDIT(row.original.id)}>Edit</Link>
        </Button>
      );
    },
  },
];
