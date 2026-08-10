"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Package } from "@/lib/db/schema";
import { createOrder } from "@/lib/db/actions/order.action";
import { formatPiastres } from "@/lib/pricing";

interface PackageCheckoutDialogProps {
  pkg: Package;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
}

interface ValidatedPromo {
  type: "fixed_price" | "discount" | "free";
  valuePiastres: number;
  willApplyDiscount: boolean;
}

export default function PackageCheckoutDialog({
  pkg,
  open,
  onOpenChange,
}: PackageCheckoutDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [validatedPromo, setValidatedPromo] = useState<ValidatedPromo | null>(
    null,
  );

  // Initialize attendees based on package ticket count
  const [attendees, setAttendees] = useState<Attendee[]>(
    Array.from({ length: pkg.ticketCount }, () => ({
      name: "",
      email: "",
      phone: "",
    })),
  );

  const handleAttendeeChange = (
    index: number,
    field: keyof Attendee,
    value: string,
  ) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError(null);
      setPromoValid(null);
      setValidatedPromo(null);
      return;
    }

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          packageId: pkg.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.valid) {
        setPromoError(null);
        setPromoValid(true);
        setValidatedPromo({
          ...data.data.promoCode,
          willApplyDiscount: data.data.willApplyDiscount ?? true,
        });
      } else {
        setPromoError(data.data.error || "Invalid promo code");
        setPromoValid(false);
        setValidatedPromo(null);
      }
    } catch {
      setPromoError("Failed to validate promo code");
      setPromoValid(false);
      setValidatedPromo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate all attendees
      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        if (!attendee.name.trim()) {
          throw new Error(`Attendee ${i + 1} name is required`);
        }
        if (
          !attendee.email.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email)
        ) {
          throw new Error(`Attendee ${i + 1} email is invalid`);
        }
        if (!attendee.phone.trim()) {
          throw new Error(`Attendee ${i + 1} phone is required`);
        }
      }

      // Validate access code if required
      if (pkg.requiresAccessCode) {
        if (!accessCode.trim()) {
          throw new Error("Access code is required for this package");
        }
        if (accessCode.trim() !== "N/A" && accessCode.trim().length < 3) {
          throw new Error("Invalid access code");
        }
      }

      const result = await createOrder({
        packageId: pkg.id,
        promoCode: promoCode.trim() || undefined,
        accessCode: accessCode.trim() || undefined,
        attendees,
      });

      if (result.success) {
        if (result.data?.sessionUrl) {
          // Redirect to Kashier
          window.location.href = result.data.sessionUrl;
        } else if (result.data?.orderId) {
          // Free order - redirect to success page
          router.push(`/tickets/success?orderId=${result.data.orderId}`);
          onOpenChange(false);
        }
      } else {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Failed to create order";

        // Check if the error is about missing accounts
        if (errorMessage.includes("don't have registered accounts")) {
          setError(
            errorMessage +
              " Please ask all attendees to create accounts first.",
          );
        } else {
          setError(errorMessage);
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPackageDiscount =
    pkg.discountedPricePerTicketPiastres != null &&
    pkg.discountedPricePerTicketPiastres > 0;
  const basePricePerTicket = hasPackageDiscount
    ? pkg.discountedPricePerTicketPiastres!
    : pkg.pricePerTicketPiastres;
  const baseTotalPrice = hasPackageDiscount
    ? pkg.discountedPricePerTicketPiastres! * pkg.ticketCount
    : pkg.totalPricePiastres;

  const pricePerTicket = formatPiastres(basePricePerTicket);

  let finalAmountPiastres = baseTotalPrice;
  let discountPiastres = hasPackageDiscount
    ? pkg.totalPricePiastres - baseTotalPrice
    : 0;

  if (validatedPromo && validatedPromo.willApplyDiscount) {
    if (validatedPromo.type === "fixed_price") {
      finalAmountPiastres = validatedPromo.valuePiastres;
      discountPiastres = pkg.totalPricePiastres - finalAmountPiastres;
    } else if (validatedPromo.type === "discount") {
      discountPiastres = validatedPromo.valuePiastres;
      finalAmountPiastres = Math.max(
        0,
        pkg.totalPricePiastres - discountPiastres,
      );
    } else if (validatedPromo.type === "free") {
      discountPiastres = pkg.totalPricePiastres;
      finalAmountPiastres = 0;
    }
  }
  const finalPrice = formatPiastres(finalAmountPiastres);
  const discountDisplay = formatPiastres(discountPiastres);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout: {pkg.name}</DialogTitle>
          <DialogDescription>
            Complete your purchase for {pkg.ticketCount} ticket
            {pkg.ticketCount > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Summary */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{pkg.name}</span>
              <span className="font-bold">{finalPrice}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {pkg.ticketCount} ticket{pkg.ticketCount > 1 ? "s" : ""} ×{" "}
              {pricePerTicket}
            </div>
            {validatedPromo && discountPiastres > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Discount applied
                </span>
                <span className="text-green-600 dark:text-green-400">
                  -{discountDisplay}
                </span>
              </div>
            )}
          </div>

          {/* Access Code (if required) */}
          {pkg.requiresAccessCode && (
            <div className="space-y-2">
              <Label htmlFor="accessCode">
                Access Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter access code (or N/A)"
                required
              />
              <p className="text-xs text-gray-500">
                Enter the access code provided to you, or &quot;N/A&quot; if not
                applicable
              </p>
            </div>
          )}

          {/* Promo Code */}
          <div className="space-y-2">
            <Label htmlFor="promoCode">Promo Code (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="promoCode"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoValid(null);
                  setPromoError(null);
                  setValidatedPromo(null);
                }}
                placeholder="Enter promo code"
                onBlur={validatePromoCode}
              />
              <Button
                type="button"
                variant="outline"
                onClick={validatePromoCode}
                disabled={!promoCode.trim()}
              >
                Validate
              </Button>
            </div>
            {promoError && <p className="text-sm text-red-500">{promoError}</p>}
            {promoValid && (
              <p className="text-sm text-green-500">
                {validatedPromo?.willApplyDiscount
                  ? "Promo code applied! Discount included."
                  : "Promo code validated but discount not applicable for this package."}
              </p>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-4">
            <Label>
              Attendee Information <span className="text-red-500">*</span>
            </Label>
            {attendees.map((attendee, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3"
              >
                <h4 className="font-medium text-sm">
                  Ticket {index + 1} of {pkg.ticketCount}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`attendee-${index}-name`}>
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`attendee-${index}-name`}
                      value={attendee.name}
                      onChange={(e) =>
                        handleAttendeeChange(index, "name", e.target.value)
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`attendee-${index}-email`}>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`attendee-${index}-email`}
                      type="email"
                      value={attendee.email}
                      onChange={(e) =>
                        handleAttendeeChange(index, "email", e.target.value)
                      }
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`attendee-${index}-phone`}>
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`attendee-${index}-phone`}
                      type="tel"
                      value={attendee.phone}
                      onChange={(e) =>
                        handleAttendeeChange(index, "phone", e.target.value)
                      }
                      placeholder="+20 1xx xxx xxxx"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${finalPrice}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
