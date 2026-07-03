"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatPiastres,
  type TicketTier,
  type PurchasableTicketType,
} from "@/lib/pricing";
import type { Offer } from "@/lib/db/schema";

interface TicketTierCardProps {
  tier: TicketTier;
  offer?: Offer | null;
  onSelect: (type: PurchasableTicketType) => void;
  highlighted?: boolean;
}

export default function TicketTierCard({
  tier,
  offer,
  onSelect,
  highlighted,
}: TicketTierCardProps) {
  const hasOffer =
    offer?.discountedPrice != null &&
    (!offer.applicableTicketTypes?.length ||
      offer.applicableTicketTypes.includes(tier.type));

  const displayPrice = hasOffer ? offer!.discountedPrice! : tier.pricePiastres;

  return (
    <Card
      className={`flex flex-col justify-between border bg-black/40 backdrop-blur-sm transition-all hover:border-primary/40 ${
        highlighted
          ? "border-primary/60 ring-1 ring-primary/20"
          : "border-white/10"
      }`}
    >
      {/* {type === "vip" && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )} */}
      <CardHeader className="text-center pb-2">
        <p className="text-xs uppercase tracking-widest text-primary">
          {tier.subtitle}
        </p>
        <CardTitle className="text-2xl font-bold">{tier.label}</CardTitle>
        <div className="mt-2">
          {hasOffer && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPiastres(tier.pricePiastres)}
            </p>
          )}
          <p className="text-3xl font-extrabold text-foreground">
            {formatPiastres(displayPrice)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 ">
        <ul className="space-y-2">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="space-y-4">
        <Button
          className="w-full py-5 font-bold tracking-wide "
          onClick={() => onSelect(tier.type)}
        >
          Select {tier.label}
        </Button>
      </CardFooter>
    </Card>
  );
}
