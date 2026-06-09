import MyTicketClient from "@/components/tickets/my-ticket-client";
import { getActiveOffers } from "@/lib/db/actions/offer.action";
import { getMyTicket } from "@/lib/db/actions/ticket.action";

interface MyTicketPageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function MyTicketPage({
  searchParams,
}: MyTicketPageProps) {
  const params = await searchParams;
  const [ticketResult, offersResult] = await Promise.all([
    getMyTicket(),
    getActiveOffers(),
  ]);

  const data =
    ticketResult.success && ticketResult.data !== undefined
      ? ticketResult.data
      : null;

  const offers =
    offersResult.success && offersResult.data ? offersResult.data : [];

  return <MyTicketClient data={data} offers={offers} reason={params.reason} />;
}
