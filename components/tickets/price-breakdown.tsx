import { formatPiastres } from "@/lib/pricing";
import type { PriceBreakdown as PriceBreakdownType } from "@/lib/pricing";

interface PriceBreakdownProps {
  breakdown: PriceBreakdownType;
}

export default function PriceBreakdown({ breakdown }: PriceBreakdownProps) {
  const hasOffer = breakdown.offerPriceApplied != null;
  const hasCoupon = breakdown.couponDiscountApplied > 0;

  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-white/2 p-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Base price</span>
        <span>{formatPiastres(breakdown.basePrice)}</span>
      </div>
      {hasOffer && (
        <div className="flex justify-between text-green-400">
          <span>Offer price</span>
          <span>{formatPiastres(breakdown.priceAfterOffer)}</span>
        </div>
      )}
      {hasCoupon && (
        <div className="flex justify-between text-green-400">
          <span>Coupon discount</span>
          <span>-{formatPiastres(breakdown.couponDiscountApplied)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-base">
        <span>Total</span>
        <span className="text-primary">{formatPiastres(breakdown.finalPrice)}</span>
      </div>
    </div>
  );
}
