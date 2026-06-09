"use client";

import { useState } from "react";

import SectionTitle from "@/components/layout/section-title";
import CheckoutDialog from "@/components/tickets/checkout-dialog";
import OffersBanner from "@/components/tickets/offers-banner";
import TicketTierCard from "@/components/tickets/ticket-tier-card";
import type { Offer } from "@/lib/db/schema";
import { pickBestOffer, type PurchasableTicketType } from "@/lib/pricing";

interface TicketsPageClientProps {
  offers: Offer[];
}

export default function TicketsPageClient({ offers }: TicketsPageClientProps) {
  const [selectedTier, setSelectedTier] = useState<PurchasableTicketType | null>(
    null,
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleSelect = (type: PurchasableTicketType) => {
    setSelectedTier(type);
    setCheckoutOpen(true);
  };

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0000] to-black pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="relative px-6">
          <SectionTitle
            eyebrow="Event Access"
            title="Get Your Ticket"
            subTitle="Choose your seat tier and complete payment to secure your spot at Luminous Darkness 2026."
          />
        </div>
      </section>

      <section className="relative py-12 px-6 lg:px-10 max-w-6xl mx-auto space-y-12">
        <OffersBanner offers={offers} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["np", "ip", "vip"] as const).map((type) => (
            <TicketTierCard
              key={type}
              type={type}
              offer={pickBestOffer(offers, type)}
              onSelect={handleSelect}
              highlighted={type === "vip"}
            />
          ))}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/2 p-6 text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Payment Instructions</p>
          <p>
            After selecting your tier, choose Cash, InstaPay, or Bank Transfer.
            Upload a screenshot of your payment proof. Our team will review and
  confirm your ticket within 24–48 hours.
          </p>
        </div>
      </section>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        ticketType={selectedTier}
        offers={offers}
      />
    </div>
  );
}
