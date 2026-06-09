import { Badge } from "@/components/ui/badge";
import { formatPiastres } from "@/lib/pricing";
import type { Offer } from "@/lib/db/schema";

interface OffersBannerProps {
  offers: Offer[];
  compact?: boolean;
}

export default function OffersBanner({
  offers,
  compact = false,
}: OffersBannerProps) {
  if (!offers.length) return null;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && (
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary text-center">
          Active Offers
        </h3>
      )}
      <div
        className={`grid gap-3 ${
          compact
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-lg border border-primary/20 bg-primary/5 p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-foreground">{offer.title}</h4>
              {offer.badgeLabel && (
                <Badge variant="outline" className="shrink-0 text-primary border-primary/30">
                  {offer.badgeLabel}
                </Badge>
              )}
            </div>
            {offer.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {offer.description}
              </p>
            )}
            {offer.discountedPrice != null && offer.originalPrice != null && (
              <p className="text-sm">
                <span className="text-muted-foreground line-through mr-2">
                  {formatPiastres(offer.originalPrice)}
                </span>
                <span className="font-semibold text-primary">
                  {formatPiastres(offer.discountedPrice)}
                </span>
              </p>
            )}
            {offer.remainingSlots != null && (
              <p className="text-xs text-muted-foreground mt-1">
                {offer.remainingSlots} slots remaining
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
