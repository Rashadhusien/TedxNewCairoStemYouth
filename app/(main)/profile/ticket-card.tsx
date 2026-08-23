// app/(root)/profile/ticket-card.tsx
"use client";

import type { ProfileData } from "@/lib/db/actions/profile.action";
import { WHATSAPP_GROUP_LINK } from "@/constants";
import { IconBrandWhatsappFilled } from "@tabler/icons-react";

type TicketCardProps = {
  ticket: NonNullable<ProfileData["ticket"]>;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending_payment: {
    label: "Awaiting payment",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    dot: "#f59e0b",
  },
  payment_submitted: {
    label: "Under review",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    dot: "#60a5fa",
  },
  confirmed: {
    label: "Confirmed",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    dot: "#4ade80",
  },
  rejected: {
    label: "Rejected",
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    dot: "#f87171",
  },
  checked_in: {
    label: "Checked in",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    dot: "#a78bfa",
  },
  cancelled: {
    label: "Cancelled",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    dot: "#6b7280",
  },
};

const TYPE_LABELS: Record<string, string> = {
  general: "General Admission",
  vip: "VIP",
  organizer: "Organizer",
  ip: "Industry Professional",
  np: "Non-Profit / Partner",
};

export function TicketCard({ ticket }: TicketCardProps) {
  const status = STATUS_CONFIG[ticket.status] ?? {
    label: ticket.status,
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.08)",
    dot: "#9ca3af",
  };

  return (
    <div className="rounded-xl border border-white/8 bg-[#111111] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-white/30">
          Your Ticket
        </p>
        {/* Status pill */}
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: status.dot }}
          />
          {status.label}
        </span>
      </div>

      {/* Ticket type */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-lg font-bold text-white">
            {TYPE_LABELS[ticket.type] ?? ticket.type}
          </p>
          <p className="mt-0.5 text-xs text-white/30">
            TEDxNewCairoSTEMYouth · Luminous Darkness 2026
          </p>
        </div>

        {/* TED mark */}
        <div className="text-right">
          <span className="text-xs font-bold tracking-widest text-[#e62b1e]">
            TEDx
          </span>
        </div>
      </div>

      {/* Divider — perforated ticket style */}
      <div className="my-4 flex items-center gap-1">
        <div className="h-px flex-1 border-t border-dashed border-white/10" />
      </div>

      {/* Footer meta */}
      <p className="text-[11px] text-white/20">
        Registered{" "}
        {new Intl.DateTimeFormat("en-EG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(ticket.createdAt))}
      </p>

      {/* Pending payment nudge */}
      {ticket.status === "pending_payment" && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
          <p className="text-xs text-amber-400">
            Complete your payment to confirm your seat at the event.
          </p>
        </div>
      )}

      {/* Confirmed — QR hint */}
      {ticket.status === "confirmed" && (
        <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2.5">
          <p className="text-xs text-green-400">
            Your QR code will be available here closer to the event date.
          </p>
        </div>
      )}

      {/* WhatsApp Group Link */}
      {(ticket.status === "confirmed" || ticket.status === "checked_in") && (
        <a
          href={WHATSAPP_GROUP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400 transition hover:bg-green-500/20 hover:border-green-500/50"
        >
          <IconBrandWhatsappFilled className="h-5 w-5" />
          Join WhatsApp Group
        </a>
      )}
    </div>
  );
}
