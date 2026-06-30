"use client";

import { useEffect, useState } from "react";
import { getActiveOffers } from "@/lib/db/actions/offer.action";
import type { Offer } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { X, Clock, Tag, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { JSX } from "react";

export default function FloatingOfferBanner(): JSX.Element | null {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [expired, setExpired] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const loadFeaturedOffer = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await getActiveOffers(true); // featuredOnly = true
      if (result.success && result.data && result.data.length > 0) {
        setOffer(result.data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadFeaturedOffer();
  }, []);

  // Slight delay before entrance so it doesn't compete with hero load-in
  useEffect(() => {
    if (!loading && offer) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [loading, offer]);

  useEffect(() => {
    if (!offer || !offer.endsAt) return;

    const updateCountdown = (): void => {
      const now = new Date();
      const endsAt = new Date(offer.endsAt!);
      const diff = endsAt.getTime() - now.getTime();

      if (diff <= 0) {
        setExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [offer]);

  if (dismissed || loading || !offer || expired) return null;

  const getOfferIcon = (): JSX.Element => {
    switch (offer.type) {
      case "early_bird":
        return <Clock className="w-4 h-4" />;
      case "promotional":
        return <Flame className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getOfferTypeLabel = (): string => {
    switch (offer.type) {
      case "early_bird":
        return "Early Bird";
      case "promotional":
        return "Flash Sale";
      case "group":
        return "Group Deal";
      case "bundle":
        return "Bundle";
      default:
        return "Special Offer";
    }
  };

  const formatPrice = (piastres: number | null): string | null => {
    if (!piastres) return null;
    return (piastres / 100).toFixed(0);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      <div className="relative flex overflow-hidden rounded-xl border border-[#C9A84C]/25 bg-[#0a0a0a]/95 shadow-[0_8px_40px_-8px_rgba(230,43,30,0.35)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss offer"
          className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Ticket stub accent column */}
        <div className="relative flex w-14 shrink-0 flex-col items-center justify-center bg-[#e62b1e]">
          <span className="absolute inset-0 animate-pulse bg-white/10" />
          <span className="relative">{getOfferIcon()}</span>
        </div>

        {/* Perforated divider */}
        <div className="border-l border-dashed border-[#C9A84C]/30" />

        <div className="flex-1 min-w-0 p-4 pl-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C]">
              {getOfferTypeLabel()}
            </span>
            {offer.badgeLabel && (
              <span className="rounded-sm bg-[#C9A84C]/15 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide text-[#C9A84C]">
                {offer.badgeLabel}
              </span>
            )}
          </div>

          <h3 className="mb-2 line-clamp-2 pr-4 font-serif text-sm font-semibold leading-snug text-white">
            {offer.title}
          </h3>

          {offer.discountedPrice && offer.originalPrice && (
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-white">
                {formatPrice(offer.discountedPrice)}
                <span className="ml-1 text-xs font-normal text-white/50">
                  EGP
                </span>
              </span>
              <span className="font-mono text-xs text-white/35 line-through">
                {formatPrice(offer.originalPrice)} EGP
              </span>
            </div>
          )}

          {offer.endsAt && timeLeft && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded border border-[#C9A84C]/25 bg-black/40 px-2 py-1">
              <Clock className="w-3 h-3 text-[#C9A84C]" />
              <span className="font-mono text-[11px] tabular-nums tracking-wide text-[#C9A84C]">
                Closes in {timeLeft}
              </span>
            </div>
          )}

          <Button
            asChild
            size="sm"
            className="w-full justify-between bg-[#e62b1e] text-white hover:bg-[#e62b1e]/90"
          >
            <Link href={ROUTES.TICKETS}>
              Get Your Ticket
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
