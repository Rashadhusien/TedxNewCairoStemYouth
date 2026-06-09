import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/lib/db/schema";

const STATUS_CONFIG: Record<
  Ticket["status"],
  { label: string; className: string }
> = {
  pending_payment: {
    label: "Pending Payment",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  payment_submitted: {
    label: "Under Review",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  checked_in: {
    label: "Checked In",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
  },
};

export default function TicketStatusBadge({
  status,
}: {
  status: Ticket["status"];
}) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
