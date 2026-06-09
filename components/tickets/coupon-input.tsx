"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateCoupon } from "@/lib/db/actions/coupon.action";
import { getActionErrorMessage } from "@/types/actions";
import type { PurchasableTicketType } from "@/lib/pricing";

interface CouponInputProps {
  ticketType: PurchasableTicketType;
  onApplied: (code: string | undefined, discount: number) => void;
  disabled?: boolean;
}

export default function CouponInput({
  ticketType,
  onApplied,
  disabled,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) {
      setMessage(null);
      setIsValid(false);
      onApplied(undefined, 0);
    }
  }, [code, onApplied]);

  const applyCoupon = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setMessage(null);

    const result = await validateCoupon({ code: code.trim(), ticketType });

    if (!result.success || !result.data) {
      setMessage(getActionErrorMessage(result, "Failed to validate coupon"));
      setIsValid(false);
      onApplied(undefined, 0);
      setLoading(false);
      return;
    }

    if (!result.data.valid) {
      setMessage(result.data.message);
      setIsValid(false);
      onApplied(undefined, 0);
    } else {
      setMessage(result.data.message);
      setIsValid(true);
      onApplied(code.trim(), result.data.discountAmount ?? 0);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          disabled={disabled || loading}
          className="py-5"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void applyCoupon()}
          disabled={disabled || loading || !code.trim()}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {message && (
        <p
          className={`text-sm ${isValid ? "text-green-400" : "text-red-400"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
