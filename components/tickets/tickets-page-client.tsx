"use client";

import { useState, useEffect } from "react";

import SectionTitle from "@/components/layout/section-title";
import CheckoutDialog from "@/components/tickets/checkout-dialog";
import OffersBanner from "@/components/tickets/offers-banner";
import TicketTierCard from "@/components/tickets/ticket-tier-card";
import type { Offer } from "@/lib/db/schema";
import {
  getTicketTiers,
  pickBestOffer,
  type PurchasableTicketType,
  type TicketTier,
} from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

interface TicketsPageClientProps {
  offers: Offer[];
  ticketTiers: Record<PurchasableTicketType, TicketTier>;
}

export default function TicketsPageClient({
  offers,
  ticketTiers,
}: TicketsPageClientProps) {
  const [selectedTier, setSelectedTier] =
    useState<PurchasableTicketType | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { status: authStatus } = useSession();
  const router = useRouter();

  const handleSelect = (type: PurchasableTicketType) => {
    if (authStatus === "unauthenticated") {
      router.push(ROUTES.LOGIN);
      return;
    }
    setSelectedTier(type);
    setCheckoutOpen(true);
  };

  if (!ticketTiers) {
    return (
      <section className="relative py-12 px-6 lg:px-10 max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["np", "ip", "vip"] as const).map((type) => (
            <Card className="w-full max-w-xs mx-auto" key={type}>
              <CardHeader>
                <Skeleton className="aspect-video w-full" />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative py-12 px-6 lg:px-10 max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["np", "ip", "vip"] as const).map((type) => (
            <TicketTierCard
              key={type}
              tier={ticketTiers[type]}
              offer={pickBestOffer(offers, type)}
              onSelect={handleSelect}
              highlighted={type === "vip"}
            />
          ))}
        </div>
      </section>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        ticketType={selectedTier}
        offers={offers}
      />
    </>
  );
}
