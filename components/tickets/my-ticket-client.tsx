"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SectionTitle from "@/components/layout/section-title";
import CheckoutDialog from "@/components/tickets/checkout-dialog";
import TicketCard from "@/components/tickets/ticket-card";
import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { Offer } from "@/lib/db/schema";
import type { MyTicketData } from "@/types/ticket";
import type { PurchasableTicketType } from "@/lib/pricing";

interface MyTicketClientProps {
  data: MyTicketData | null;
  offers: Offer[];
  reason?: string;
}

export default function MyTicketClient({
  data,
  offers,
  reason,
}: MyTicketClientProps) {
  const router = useRouter();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!data) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center pt-28 px-6 text-center space-y-6">
        <SectionTitle
          eyebrow="Your Ticket"
          title="No Ticket Yet"
          subTitle="You haven't purchased a ticket yet. Browse our tiers and secure your spot."
        />
        <Button asChild size="lg">
          <Link href={ROUTES.TICKETS}>Browse Tickets</Link>
        </Button>
      </div>
    );
  }

  const { ticket, user } = data;
  const attendeeName = user.fullName ?? user.email;

  if (ticket.status === "confirmed" || ticket.status === "checked_in") {
    return (
      <div className="bg-black min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <SectionTitle
              eyebrow="Your Ticket"
              title="You're In!"
              subTitle="Your ticket is confirmed. Save your QR code for event day entry."
            />
          </div>
          <TicketCard
            ticket={ticket}
            attendeeName={attendeeName}
            attendeeEmail={user.email}
          />
        </div>
      </div>
    );
  }

  if (ticket.status === "payment_submitted") {
    return (
      <div className="bg-black min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-lg mx-auto space-y-6 text-center">
          <SectionTitle
            eyebrow="Your Ticket"
            title="Under Review"
            subTitle="We've received your payment proof. Our team is reviewing it — you'll be notified once confirmed."
          />
          <TicketStatusBadge status={ticket.status} />
          {ticket.paymentScreenshotUrl && (
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Image
                src={ticket.paymentScreenshotUrl}
                alt="Submitted payment proof"
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (ticket.status === "rejected") {
    return (
      <div className="bg-black min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-lg mx-auto space-y-6 text-center">
          <SectionTitle
            eyebrow="Your Ticket"
            title="Payment Rejected"
            subTitle="Your payment proof was not accepted. Please review the reason and resubmit."
          />
          <TicketStatusBadge status={ticket.status} />
          {ticket.rejectionReason && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
              {ticket.rejectionReason}
            </div>
          )}
          <Button size="lg" onClick={() => setCheckoutOpen(true)}>
            Resubmit Payment Proof
          </Button>
          <CheckoutDialog
            open={checkoutOpen}
            onOpenChange={(open) => {
              setCheckoutOpen(open);
              if (!open) router.refresh();
            }}
            ticketType={ticket.type as PurchasableTicketType}
            offers={offers}
          />
        </div>
      </div>
    );
  }

  if (ticket.status === "pending_payment") {
    return (
      <div className="bg-black min-h-screen pt-28 pb-16 px-6">
        <div className="max-w-lg mx-auto space-y-6 text-center">
          <SectionTitle
            eyebrow="Your Ticket"
            title="Complete Your Purchase"
            subTitle="Your ticket is reserved. Upload your payment proof to complete checkout."
          />
          {reason === "ticket_required" && (
            <p className="text-sm text-yellow-400">
              A confirmed ticket is required to access that page.
            </p>
          )}
          <Button size="lg" onClick={() => setCheckoutOpen(true)}>
            Complete Payment
          </Button>
          <CheckoutDialog
            open={checkoutOpen}
            onOpenChange={(open) => {
              setCheckoutOpen(open);
              if (!open) router.refresh();
            }}
            ticketType={ticket.type as PurchasableTicketType}
            offers={offers}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-28 px-6 text-center">
      <TicketStatusBadge status={ticket.status} />
      <Button asChild className="mt-6">
        <Link href={ROUTES.TICKETS}>Browse Tickets</Link>
      </Button>
    </div>
  );
}
