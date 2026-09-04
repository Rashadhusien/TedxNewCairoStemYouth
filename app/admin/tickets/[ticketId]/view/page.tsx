import { notFound } from "next/navigation";
import { getTicketById } from "@/lib/db/actions/ticket.action";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface AdminTicketViewPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function AdminTicketViewPage({
  params,
}: AdminTicketViewPageProps) {
  const { ticketId } = await params;

  const result = await getTicketById(ticketId);
  if (!result.success) {
    console.error("Failed to get ticket:", result);
    notFound();
  }
  if (!result.data || !result.data.ticket) {
    console.error("No ticket data found");
    notFound();
  }

  const { ticket, user } = result.data;
  const attendeeName = user?.fullName || ticket.attendeeName || "Attendee";

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
    width: 300,
    margin: 2,
    type: "image/png",
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-red-500 font-bold text-2xl tracking-widest">
              TEDx New Cairo Stem Youth
            </div>
            <div className="text-zinc-400 text-sm">Luminous Darkness 2026</div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <Image
                src={qrCodeDataUrl}
                alt="Ticket QR Code"
                width={240}
                height={240}
              />
            </div>
          </div>

          {/* Attendee Info */}
          <div className="space-y-3 text-center">
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-wider">
                Attendee
              </div>
              <div className="text-white text-xl font-semibold">
                {attendeeName}
              </div>
            </div>

            {ticket.type === "vip" && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2">
                <div className="text-amber-500 text-xs font-bold uppercase tracking-widest">
                  VIP
                </div>
              </div>
            )}

            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-wider">
                Ticket ID
              </div>
              <div className="text-zinc-300 text-sm font-mono">
                {ticket.qrCode.slice(0, 8)}...
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-zinc-600 text-xs">
            Present this QR code at the venue entrance
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
