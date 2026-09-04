import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { getOrderWithTickets } from "@/lib/db/actions/order.action";
import { notFound } from "next/navigation";
import { formatPiastres } from "@/lib/pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import { Button } from "@/components/ui/button";

interface AdminOrderDetailsPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailsPage({
  params,
}: AdminOrderDetailsPageProps) {
  const { orderId } = await params;

  const orderData = await getOrderWithTickets(orderId);
  if (!orderData) {
    notFound();
  }

  const { order, tickets: orderTickets } = orderData;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN.ORDERS.HOME}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-muted-foreground text-sm">
            Order ID: {order.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!order.userId && (
              <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-blue-800 text-sm font-medium">
                  Guest Order (no user account)
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Package</div>
                <div className="font-medium">{order.packageName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium capitalize">
                  {order.status.replace("_", " ")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Original Amount
                </div>
                <div className="font-medium">
                  {formatPiastres(order.originalAmountPiastres)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Discount</div>
                <div className="font-medium text-green-600">
                  {order.discountPiastres > 0
                    ? `-${formatPiastres(order.discountPiastres)}`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Final Amount
                </div>
                <div className="font-medium">
                  {formatPiastres(order.finalAmountPiastres)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Promo Code</div>
                <div className="font-medium">{order.promoCode || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Access Code</div>
                <div className="font-medium">{order.accessCode || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Payment Reference
                </div>
                <div className="font-medium">
                  {order.paymentReference || "—"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="font-medium">
                  {order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets ({orderTickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {ticket.attendeeName || "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.attendeeEmail || "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.attendeePhone || "—"}
                    </div>
                    {ticket.type === "vip" && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-amber-500">
                        VIP
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <TicketStatusBadge status={ticket.status} />
                    <div className="text-right">
                      <div className="font-medium">
                        {formatPiastres(ticket.pricePaid)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.qrCode.slice(0, 8)}...
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/tickets/${ticket.id}/view`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Ticket
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
