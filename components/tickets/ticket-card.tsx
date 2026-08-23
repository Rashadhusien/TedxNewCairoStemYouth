"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPiastres, TICKET_TIERS } from "@/lib/pricing";
import type { Ticket } from "@/lib/db/schema";
import { WHATSAPP_GROUP_LINK } from "@/constants";
import { IconBrandWhatsappFilled } from "@tabler/icons-react";

interface TicketCardProps {
  ticket: {
    id: string;
    type: string;
    qrCode: string | null;
    status: Ticket["status"];
    pricePaid: number;
    createdAt: Date;
  };
  attendeeName: string;
  attendeeEmail: string;
  packageName?: string;
  promoCode?: string | null;
  originalAmountPiastres?: number;
  discountPiastres?: number;
}

export default function TicketCard({
  ticket,
  attendeeName,
  attendeeEmail,
  packageName,
  promoCode,
  originalAmountPiastres,
  discountPiastres,
}: TicketCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVip = ticket.type === "vip";

  // Use package name if available, otherwise fall back to ticket tier
  const displayLabel = packageName
    ? packageName
    : ticket.type in TICKET_TIERS
      ? TICKET_TIERS[ticket.type as keyof typeof TICKET_TIERS].label
      : ticket.type.toUpperCase();

  useEffect(() => {
    if (!canvasRef.current || !ticket.qrCode) return;

    void QRCode.toCanvas(canvasRef.current, ticket.qrCode, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [ticket.qrCode]);

  const downloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `tedx-ticket-${ticket.qrCode}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <Card
      className={`max-w-md mx-auto overflow-hidden border-primary/30 bg-linear-to-b from-primary/5 to-black ${
        isVip ? "border-amber-400/50" : ""
      }`}
    >
      <div
        className={`h-1 ${
          isVip
            ? "bg-linear-to-r from-amber-400 via-yellow-400 to-amber-400"
            : "bg-linear-to-r from-primary via-red-600 to-primary"
        }`}
      />
      <CardHeader className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          TEDxNewCairoSTEMYouth
        </p>
        <CardTitle className="text-2xl font-extrabold">
          Luminous Darkness 2026
        </CardTitle>
        <div className="flex flex-col items-center gap-2">
          {isVip && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
              VIP
            </span>
          )}
          <TicketStatusBadge status={ticket.status as Ticket["status"]} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-1">
          <p className="text-lg font-bold">{attendeeName}</p>
          <p className="text-sm text-muted-foreground">{attendeeEmail}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Package</p>
          {isVip ? (
            <>
              <p className="text-xl font-semibold text-amber-300">VIP Access</p>
              <p className="text-xs text-muted-foreground">{displayLabel}</p>
            </>
          ) : (
            <p className="text-xl font-semibold text-primary">{displayLabel}</p>
          )}
          {originalAmountPiastres &&
          discountPiastres &&
          discountPiastres > 0 ? (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="line-through text-muted-foreground">
                {formatPiastres(originalAmountPiastres)}
              </span>
              <span className="text-green-500 font-semibold">
                {formatPiastres(ticket.pricePaid)}
              </span>
            </div>
          ) : (
            <p className="text-sm">{formatPiastres(ticket.pricePaid)}</p>
          )}
          {promoCode && (
            <p className="text-xs text-primary font-medium">
              Promo: {promoCode}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-white rounded-lg">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {ticket.qrCode}
          </p>
          <Button variant="outline" size="sm" onClick={downloadQr}>
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>

        {isVip ? (
          <p className="text-xs text-amber-300/90">
            VIP ticket — present this QR code at the VIP entrance for front
            seating.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Present this QR code at the venue entrance on event day.
          </p>
        )}

        {/* WhatsApp Group Link */}
        <a
          href={WHATSAPP_GROUP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400 transition hover:bg-green-500/20 hover:border-green-500/50"
        >
          <IconBrandWhatsappFilled className="h-5 w-5" />
          Join WhatsApp Group
        </a>
      </CardContent>
    </Card>
  );
}
