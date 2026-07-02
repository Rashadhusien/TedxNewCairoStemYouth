"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMyTicket } from "@/lib/db/actions/ticket.action";
import { XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type TicketStatus = "loading" | "pending_payment" | "confirmed" | "rejected" | "cancelled";

export default function TicketFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<TicketStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Missing order ID");
      setStatus("rejected");
      return;
    }

    const fetchTicketStatus = async () => {
      try {
        const result = await getMyTicket();

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
        setStatus(ticketStatus as TicketStatus);
      } catch (err) {
        console.error("Error fetching ticket status:", err);
        setError("An error occurred while checking your payment status");
        setStatus("rejected");
      }
    };

    fetchTicketStatus();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Payment Failed</h2>
            <p className="text-gray-300">
              {error || "Your payment could not be completed. Please try again or use a different payment method."}
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 font-mono">
                Order ID: {orderId}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/tickets")}
              className="bg-[#e62b1e] hover:bg-[#c42318] text-white"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}