"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMyTicket } from "@/lib/db/actions/ticket.action";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type TicketStatus =
  | "loading"
  | "pending_payment"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "timeout";

export default function TicketSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const paymentStatusParam = searchParams.get("paymentStatus");

  // console.log(paymentStatusParam);

  const [status, setStatus] = useState<TicketStatus>("loading");
  // const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Missing order ID");
      setStatus("rejected");
      return;
    }
    // const knownFailure = paymentStatusParam && paymentStatusParam !== "SUCCESS";

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const maxAttempts = 30;

    const pollTicketStatus = async () => {
      try {
        const result = await getMyTicket();
        if (cancelled) return;

        if (!result.success) {
          setError("Failed to fetch ticket status");
          return;
        }

        const ticketData = result.data;
        if (!ticketData) {
          setError("Ticket not found");
          setStatus("rejected");
          return;
        }

        const ticketStatus = ticketData.ticket.status;

        console.log(ticketStatus);

        if (ticketStatus === "confirmed") {
          setStatus("confirmed");
          return;
        }

        if (ticketStatus === "rejected" || ticketStatus === "cancelled") {
          setStatus(ticketStatus as TicketStatus);
          return;
        }

        if (ticketStatus === "pending_payment") {
          setStatus("pending_payment");
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(pollTicketStatus, 2000);
        } else {
          setStatus("timeout");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error polling ticket status:", err);
        setError("An error occurred while checking your payment status");
        setStatus("rejected");
      }
    };

    pollTicketStatus();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orderId, paymentStatusParam]);
  const renderContent = () => {
    switch (status) {
      case "loading":
      case "pending_payment":
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#e62b1e]" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Confirming your payment…
              </h2>
              <p className="text-gray-400">
                Please wait while we verify your payment with Kashier.
              </p>
              <p className="text-sm text-gray-500 font-mono">
                Order ID: {orderId}
              </p>
            </div>
          </div>
        );

      case "confirmed":
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">
                You&apos;re in! 🎉
              </h2>
              <p className="text-gray-300">
                Your payment has been confirmed and your ticket is ready.
              </p>
              <p className="text-sm text-gray-500 font-mono">
                Order ID: {orderId}
              </p>
            </div>
            <Button
              onClick={() => router.push("/profile")}
              className="bg-[#e62b1e] hover:bg-[#c42318] text-white"
            >
              View My Ticket
            </Button>
          </div>
        );

      case "rejected":
      case "cancelled":
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">
                Payment Not Completed
              </h2>
              <p className="text-gray-300">
                {error ||
                  "Your payment could not be processed. Please try again."}
              </p>
              <p className="text-sm text-gray-500 font-mono">
                Order ID: {orderId}
              </p>
            </div>
            <Button
              onClick={() => router.push("/tickets")}
              className="bg-[#e62b1e] hover:bg-[#c42318] text-white"
            >
              Try Again
            </Button>
          </div>
        );

      case "timeout":
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20">
              <Clock className="h-12 w-12 text-yellow-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">
                Taking Longer Than Expected
              </h2>
              <p className="text-gray-300">
                Your payment is still being processed. Please check your email
                for confirmation.
              </p>
              <p className="text-sm text-gray-500 font-mono">
                Order ID: {orderId}
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/profile")}
                className="bg-[#e62b1e] hover:bg-[#c42318] text-white"
              >
                Check My Ticket
              </Button>
              <Button
                onClick={() => router.push("/tickets")}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Back to Tickets
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">
                Something Went Wrong
              </h2>
              <p className="text-gray-300">
                {error || "An unexpected error occurred."}
              </p>
            </div>
            <Button
              onClick={() => router.push("/tickets")}
              className="bg-[#e62b1e] hover:bg-[#c42318] text-white"
            >
              Back to Tickets
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#0a0a0a] text-white">
      <div className="container mx-auto max-w-2xl px-4">{renderContent()}</div>
    </div>
  );
}
