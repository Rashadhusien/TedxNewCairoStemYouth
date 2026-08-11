"use client";

import { useState } from "react";

interface ContinuePaymentButtonProps {
  orderId: string;
}

export function ContinuePaymentButton({ orderId }: ContinuePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinuePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/resume-kashier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resume payment session");
      }

      if (data.success && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleContinuePayment}
        disabled={isLoading}
        className="mt-3 inline-block rounded-md bg-[#e62b1e] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#c42419] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Loading..." : "Complete Payment"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}