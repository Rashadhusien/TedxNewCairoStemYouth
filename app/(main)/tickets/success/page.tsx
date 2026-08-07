"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrderWithTickets } from "@/lib/db/actions/order.action";
import { getMyTicket } from "@/lib/db/actions/ticket.action";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orders, tickets } from "@/lib/db/schema";

type OrderStatus =
  | "loading"
  | "pending_payment"
  | "paid"
  | "failed"
  | "cancelled"
  | "timeout";

function TicketSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const paymentStatusParam = searchParams.get("paymentStatus");

  const [status, setStatus] = useState<OrderStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    order: typeof orders.$inferSelect;
    tickets: (typeof tickets.$inferSelect)[];
  } | null>(null);
  const [isLegacyTicket, setIsLegacyTicket] = useState(false);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const maxAttempts = 30;

    const pollOrderStatus = async () => {
      try {
        // Try new order system first
        let result = await getOrderWithTickets(orderId);

        if (cancelled) return;

        // If no order found, try legacy ticket system
        if (!result) {
          const legacyTicket = await getMyTicket();
          if (
            legacyTicket.success &&
            legacyTicket.data &&
            legacyTicket.data.ticket &&
            legacyTicket.data.ticket.id === orderId
          ) {
            // Legacy ticket found
            setIsLegacyTicket(true);
            const ticketStatus = legacyTicket.data.ticket.status;

            console.log("Legacy ticket status:", ticketStatus);

            if (ticketStatus === "confirmed" || ticketStatus === "checked_in") {
              setStatus("paid");
              return;
            }

            if (ticketStatus === "rejected" || ticketStatus === "cancelled") {
              setStatus(ticketStatus as OrderStatus);
              return;
            }

            if (
              ticketStatus === "pending_payment" ||
              ticketStatus === "payment_submitted"
            ) {
              setStatus("pending_payment");
            }

            attempts += 1;
            if (attempts < maxAttempts) {
              timeoutId = setTimeout(pollOrderStatus, 2000);
            } else {
              setStatus("timeout");
            }
            return;
          }

          setError("Order not found");
          setStatus("failed");
          return;
        }

        const { order, tickets: orderTickets } = result;
        setOrderData({ order, tickets: orderTickets });

        const orderStatus = order.status;

        console.log("Order status:", orderStatus);

        if (orderStatus === "paid") {
          setStatus("paid");
          return;
        }

        if (orderStatus === "failed" || orderStatus === "cancelled") {
          setStatus(orderStatus as OrderStatus);
          return;
        }

        if (orderStatus === "pending_payment") {
          setStatus("pending_payment");
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(pollOrderStatus, 2000);
        } else {
          setStatus("timeout");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error polling order status:", err);
        setError("An error occurred while checking your payment status");
        setStatus("failed");
      }
    };

    pollOrderStatus();

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

      case "paid":
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
                Your payment has been confirmed and your tickets are ready.
              </p>
              <p className="text-sm text-gray-500 font-mono">
                {isLegacyTicket ? "Ticket ID" : "Order ID"}: {orderId}
              </p>
              {orderData && orderData.tickets && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">
                    {orderData.tickets.length} ticket
                    {orderData.tickets.length > 1 ? "s" : ""} generated
                  </p>
                  {orderData.tickets.map((ticket: any, i: number) => (
                    <div key={i} className="text-sm text-gray-300">
                      {ticket.attendeeName || `Ticket ${i + 1}`} -{" "}
                      {ticket.attendeeEmail || "No email"}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => router.push("/profile")}
              className="bg-[#e62b1e] hover:bg-[#c42318] text-white"
            >
              View My Tickets
            </Button>
          </div>
        );

      case "failed":
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
                Check My Tickets
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

export default function TicketSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center bg-[#0a0a0a] text-white">
          <div className="container mx-auto max-w-2xl px-4">
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#e62b1e]" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Loading...</h2>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <TicketSuccessContent />
    </Suspense>
  );
}
