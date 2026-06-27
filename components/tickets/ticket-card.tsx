"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPiastres, TICKET_TIERS } from "@/lib/pricing";
import type { Ticket } from "@/lib/db/schema";
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
}

export default function TicketCard({
  ticket,
  attendeeName,
  attendeeEmail,
}: TicketCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tierLabel =
    ticket.type in TICKET_TIERS
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
    <Card className="max-w-md mx-auto border-primary/30 bg-linear-to-b from-primary/5 to-black overflow-hidden">
      <div className="h-1 bg-linear-to-r from-primary via-red-600 to-primary" />
      <CardHeader className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          TEDxNewCairoSTEMYouth
        </p>
        <CardTitle className="text-2xl font-extrabold">
          Luminous Darkness 2026
        </CardTitle>
        <div>
          <TicketStatusBadge status={ticket.status as Ticket["status"]} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-1">
          <p className="text-lg font-bold">{attendeeName}</p>
          <p className="text-sm text-muted-foreground">{attendeeEmail}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Ticket Tier</p>
          <p className="text-xl font-semibold text-primary">{tierLabel}</p>
          <p className="text-sm">{formatPiastres(ticket.pricePaid)}</p>
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

        <p className="text-xs text-muted-foreground">
          Present this QR code at the venue entrance on event day.
        </p>
      </CardContent>
    </Card>
  );
}
