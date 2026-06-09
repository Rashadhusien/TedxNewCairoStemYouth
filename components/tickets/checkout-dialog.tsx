"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import CouponInput from "@/components/tickets/coupon-input";
import PaymentUpload from "@/components/tickets/payment-upload";
import PriceBreakdown from "@/components/tickets/price-breakdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHODS } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { purchaseTicket } from "@/lib/db/actions/ticket.action";
import { getActionErrorMessage } from "@/types/actions";
import {
  computeFinalPrice,
  pickBestOffer,
  TICKET_TIERS,
  type PurchasableTicketType,
} from "@/lib/pricing";
import { TicketPurchaseSchema } from "@/lib/validation";
import type { Offer } from "@/lib/db/schema";
import type { UploadWidgetValue } from "@/types";

const checkoutFormSchema = TicketPurchaseSchema.omit({
  screenshotUrl: true,
  screenshotPublicId: true,
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

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
  const [upload, setUpload] = useState<UploadWidgetValue | null>(null);
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponDiscount, setCouponDiscount] = useState(0);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      ticketType: "np",
      paymentMethod: "instapay",
      senderName: "",
      senderPhone: "",
      transactionRef: "",
      notes: "",
      couponCode: "",
    },
  });

  useEffect(() => {
    if (ticketType) {
      form.setValue("ticketType", ticketType);
    }
  }, [ticketType, form]);

  const handleCouponApplied = useCallback(
    (code: string | undefined, discount: number) => {
      setCouponCode(code);
      setCouponDiscount(discount);
      form.setValue("couponCode", code ?? "");
    },
    [form],
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

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!session?.user) {
      router.push(`${ROUTES.LOGIN}?callbackUrl=${ROUTES.TICKETS}`);
      return;
    }

    if (!upload?.url) {
      toast.error("Please upload your payment screenshot");
      return;
    }

    const result = await purchaseTicket({
      ...data,
      couponCode: couponCode,
      screenshotUrl: upload.url,
      screenshotPublicId: upload.publicId,
    });

    if (!result.success) {
      toast.error(getActionErrorMessage(result, "Failed to submit payment"));
      return;
    }

    toast.success("Payment submitted!", {
      description:
        "Your ticket is under review. We'll notify you once confirmed.",
    });

    onOpenChange(false);
    router.push(ROUTES.MY_TICKET);
    router.refresh();
  };

  if (!ticketType) return null;

  const tier = TICKET_TIERS[ticketType];
  const paymentMethod = form.watch("paymentMethod");
  const paymentInfo = PAYMENT_METHODS[paymentMethod];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout — {tier.label}</DialogTitle>
          <DialogDescription>
            Complete your payment and upload proof of transfer.
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              <FieldLabel>Payment Method</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {(
                  Object.keys(PAYMENT_METHODS) as Array<
                    keyof typeof PAYMENT_METHODS
                  >
                ).map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant={paymentMethod === method ? "default" : "outline"}
                    className="text-xs"
                    onClick={() => form.setValue("paymentMethod", method)}
                  >
                    {PAYMENT_METHODS[method].label}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2 p-3 rounded-lg bg-muted/30">
                {paymentInfo.instructions}
                {"account" in paymentInfo && (
                  <span className="block mt-1 font-mono font-semibold">
                    {paymentInfo.account}
                  </span>
                )}
                {"iban" in paymentInfo && (
                  <span className="block mt-1 font-mono font-semibold text-xs">
                    {paymentInfo.iban}
                  </span>
                )}
              </p>
            </FieldGroup>

            {displayBreakdown && (
              <PriceBreakdown breakdown={displayBreakdown} />
            )}

            <CouponInput
              ticketType={ticketType}
              onApplied={handleCouponApplied}
              disabled={form.formState.isSubmitting}
            />

            <FieldGroup>
              <Controller
                name="senderName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Sender Name</FieldLabel>
                    <Input {...field} placeholder="Name on transfer" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="senderPhone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Sender Phone</FieldLabel>
                    <Input {...field} placeholder="Phone used for payment" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="transactionRef"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Transaction Reference (optional)</FieldLabel>
                    <Input {...field} placeholder="Reference number if any" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Field>
              <FieldLabel>Payment Screenshot</FieldLabel>
              <PaymentUpload
                value={upload}
                onChange={setUpload}
                disabled={form.formState.isSubmitting}
              />
            </Field>

            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Notes (optional)</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Any additional details"
                    rows={2}
                  />
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full py-5 font-bold"
              disabled={form.formState.isSubmitting || !upload}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Payment Proof"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
