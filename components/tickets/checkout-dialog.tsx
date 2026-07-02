"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import CouponInput from "@/components/tickets/coupon-input";
import PriceBreakdown from "@/components/tickets/price-breakdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { ROUTES } from "@/constants/routes";
import { createKashierCheckoutSession } from "@/lib/db/actions/payment.action";
import { getActionErrorMessage } from "@/types/actions";
import {
  computeFinalPrice,
  pickBestOffer,
  TICKET_TIERS,
  type PurchasableTicketType,
} from "@/lib/pricing";
import type { Offer } from "@/lib/db/schema";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketType: PurchasableTicketType | null;
  offers: Offer[];
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  ticketType,
  offers,
}: CheckoutDialogProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleCouponApplied = useCallback(
    (code: string | undefined, discount: number) => {
      setCouponCode(code);
      setCouponDiscount(discount);
    },
    [],
  );

  const bestOffer = useMemo(() => {
    if (!ticketType) return null;
    return pickBestOffer(offers, ticketType);
  }, [offers, ticketType]);

  const priceBreakdown = useMemo(() => {
    if (!ticketType) return null;
    return computeFinalPrice(ticketType, bestOffer, null);
  }, [ticketType, bestOffer]);

  const displayBreakdown = useMemo(() => {
    if (!priceBreakdown) return null;
    if (couponDiscount > 0) {
      return {
        ...priceBreakdown,
        couponDiscountApplied: couponDiscount,
        finalPrice: Math.max(
          0,
          priceBreakdown.priceAfterOffer - couponDiscount,
        ),
      };
    }
    return priceBreakdown;
  }, [priceBreakdown, couponDiscount]);

  const handleCheckout = async () => {
    if (!session?.user || !ticketType) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createKashierCheckoutSession({
        ticketType,
        couponCode,
      });

      if (!result.success) {
        toast.error(getActionErrorMessage(result, "Failed to start checkout"));
        return;
      }

      if (result.data?.sessionUrl) {
        window.location.href = result.data.sessionUrl;
      } else {
        toast.error("Failed to get checkout URL");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred while starting checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticketType) return null;

  const tier = TICKET_TIERS[ticketType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout — {tier.label}</DialogTitle>
          <DialogDescription>
            Complete your payment securely via Kashier.
          </DialogDescription>
        </DialogHeader>

        {status === "unauthenticated" ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-muted-foreground">
              Please sign in to purchase a ticket.
            </p>
            <Button
              onClick={() =>
                router.push(`${ROUTES.LOGIN}?callbackUrl=${ROUTES.TICKETS}`)
              }
            >
              Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {displayBreakdown && (
              <PriceBreakdown breakdown={displayBreakdown} />
            )}

            <CouponInput
              ticketType={ticketType}
              onApplied={handleCouponApplied}
              disabled={isSubmitting}
            />

            <Field>
              <div className="rounded-lg border border-white/10 bg-white/2 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">
                  Secure Payment
                </p>
                <p>
                  You will be redirected to Kashier's secure payment page to
                  complete your purchase. We accept all major cards and digital
                  wallets.
                </p>
              </div>
            </Field>

            <Button
              onClick={handleCheckout}
              className="w-full py-5 font-bold bg-[#e62b1e] hover:bg-[#c42318]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Redirecting...</span>
                </>
              ) : (
                "Pay via Kashier"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
