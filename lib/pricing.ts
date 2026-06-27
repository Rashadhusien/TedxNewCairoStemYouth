import type { Coupon, Offer } from "@/lib/db/schema";

export type PurchasableTicketType = "vip" | "ip" | "np";

export const TICKET_TIERS: Record<
  PurchasableTicketType,
  {
    type: PurchasableTicketType;
    label: string;
    subtitle: string;
    pricePiastres: number;
    features: string[];
  }
> = {
  vip: {
    type: "vip",
    label: "VIP Seat",
    subtitle: "Very Important Person",
    pricePiastres: 55_000,
    features: [
      "Front-row seating",
      "VIP lounge access",
      "Exclusive networking session",
      "Premium event kit",
    ],
  },
  ip: {
    type: "ip",
    label: "IP Seat",
    subtitle: "Important Person",
    pricePiastres: 45_000,
    features: [
      "Priority seating",
      "Networking break access",
      "Event kit included",
    ],
  },
  np: {
    type: "np",
    label: "NP Seat",
    subtitle: "Normal Person",
    pricePiastres: 35_000,
    features: [
      "General admission",
      "Full-day access to all talks",
      "Event kit included",
    ],
  },
};

export function piastresToEgp(piastres: number): number {
  return piastres / 100;
}

export function egpToPiastres(egp: number): number {
  return Math.round(egp * 100);
}

export function formatPiastres(piastres: number): string {
  const egp = piastresToEgp(piastres);
  return `${egp.toLocaleString("en-EG", { maximumFractionDigits: 0 })} EGP`;
}

export function isOfferActive(offer: Offer, now = new Date()): boolean {
  if (!offer.isActive) return false;
  if (offer.startsAt && offer.startsAt > now) return false;
  if (offer.endsAt && offer.endsAt < now) return false;
  if (offer.remainingSlots !== null && offer.remainingSlots <= 0) return false;
  return true;
}

export function isCouponActive(coupon: Coupon, now = new Date()): boolean {
  if (!coupon.isActive) return false;
  if (coupon.validFrom && coupon.validFrom > now) return false;
  if (coupon.validUntil && coupon.validUntil < now) return false;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return false;
  return true;
}

export function offerAppliesToTier(
  offer: Offer,
  ticketType: PurchasableTicketType,
): boolean {
  if (!offer.applicableTicketTypes?.length) return true;
  return offer.applicableTicketTypes.includes(ticketType);
}

export function couponAppliesToTier(
  coupon: Coupon,
  ticketType: PurchasableTicketType,
): boolean {
  if (!coupon.applicableTicketTypes?.length) return true;
  return coupon.applicableTicketTypes.includes(ticketType);
}

export function getBasePrice(ticketType: PurchasableTicketType): number {
  return TICKET_TIERS[ticketType].pricePiastres;
}

export function applyOfferPrice(
  basePrice: number,
  offer: Offer | null,
): {
  priceAfterOffer: number;
  offerId: string | null;
  offerPriceApplied: number | null;
} {
  if (!offer || offer.discountedPrice == null) {
    return {
      priceAfterOffer: basePrice,
      offerId: null,
      offerPriceApplied: null,
    };
  }

  return {
    priceAfterOffer: offer.discountedPrice,
    offerId: offer.id,
    offerPriceApplied: offer.discountedPrice,
  };
}

export function applyCouponDiscount(
  price: number,
  coupon: Coupon | null,
): {
  finalPrice: number;
  couponDiscountApplied: number;
  couponId: string | null;
} {
  if (!coupon) {
    return { finalPrice: price, couponDiscountApplied: 0, couponId: null };
  }

  let discount = 0;

  if (coupon.type === "fixed") {
    discount = coupon.discountAmount;
  } else if (coupon.type === "percentage") {
    discount = Math.round((price * coupon.percentageOff) / 100);
  }

  const finalPrice = Math.max(0, price - discount);

  return {
    finalPrice,
    couponDiscountApplied: price - finalPrice,
    couponId: coupon.id,
  };
}

export interface PriceBreakdown {
  basePrice: number;
  priceAfterOffer: number;
  finalPrice: number;
  couponDiscountApplied: number;
  offerId: string | null;
  offerPriceApplied: number | null;
  couponId: string | null;
}

export function computeFinalPrice(
  ticketType: PurchasableTicketType,
  offer: Offer | null,
  coupon: Coupon | null,
): PriceBreakdown {
  const basePrice = getBasePrice(ticketType);
  const { priceAfterOffer, offerId, offerPriceApplied } = applyOfferPrice(
    basePrice,
    offer,
  );

  const minOrder = coupon?.minOrderAmount ?? 0;
  const applicableCoupon =
    coupon && priceAfterOffer >= minOrder ? coupon : null;

  const { finalPrice, couponDiscountApplied, couponId } = applyCouponDiscount(
    priceAfterOffer,
    applicableCoupon,
  );

  return {
    basePrice,
    priceAfterOffer,
    finalPrice,
    couponDiscountApplied,
    offerId,
    offerPriceApplied,
    couponId,
  };
}

export function pickBestOffer(
  offers: Offer[],
  ticketType: PurchasableTicketType,
  now = new Date(),
): Offer | null {
  const eligible = offers.filter(
    (offer) =>
      isOfferActive(offer, now) &&
      offerAppliesToTier(offer, ticketType) &&
      offer.discountedPrice != null,
  );

  if (!eligible.length) return null;

  return eligible.reduce((best, current) => {
    const bestPrice = best.discountedPrice ?? Infinity;
    const currentPrice = current.discountedPrice ?? Infinity;
    return currentPrice < bestPrice ? current : best;
  });
}
