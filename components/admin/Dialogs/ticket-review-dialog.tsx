"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { reviewTicket } from "@/lib/db/actions/ticket.action";
import { getActionErrorMessage } from "@/types/actions";
import { formatPiastres } from "@/lib/pricing";
import type { TicketWithRelations } from "@/types/ticket";
import { useRouter } from "next/navigation";

interface TicketReviewDialogProps {
  ticket: TicketWithRelations | null;
}

export default function TicketReviewDialog({
  ticket,
}: TicketReviewDialogProps) {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!ticket) return null;

  const handleReview = async (action: "approve" | "reject") => {
    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    const result = await reviewTicket({
      ticketId: ticket.id,
      action,
      rejectionReason: action === "reject" ? rejectionReason : undefined,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(getActionErrorMessage(result, "Failed to review ticket"));
      return;
    }

    toast.success(action === "approve" ? "Ticket approved" : "Ticket rejected");
    setRejectionReason("");
    router.refresh();
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) router.refresh();
      }}
    >
      <DialogTrigger asChild>
        <Button>view</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full sm:min-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket Review
            <TicketStatusBadge status={ticket.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground">Attendee</p>
              <p className="font-medium">{ticket.user?.fullName ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{ticket.user?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tier</p>
              <p className="font-medium uppercase">{ticket.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">{formatPiastres(ticket.pricePaid)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">{ticket.paymentMethod}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sender</p>
              <p className="font-medium">
                {ticket.paymentSenderName} ({ticket.paymentSenderPhone})
              </p>
            </div>
          </div>

          {ticket.paymentScreenshotUrl && (
            <div>
              <p className="text-muted-foreground mb-2">Payment Screenshot</p>
              <Image
                src={ticket.paymentScreenshotUrl}
                alt="Payment proof"
                width={600}
                height={400}
                className="w-full rounded-lg border max-h-100 object-contain "
              />
            </div>
          )}

          {ticket.status === "payment_submitted" && (
            <div className="space-y-3 pt-2">
              <Textarea
                placeholder="Rejection reason (required if rejecting)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => void handleReview("approve")}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Approve"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void handleReview("reject")}
                  disabled={loading}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
