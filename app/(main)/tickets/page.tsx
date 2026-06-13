import TicketsPageClient from "@/components/tickets/tickets-page-client";
import { getActiveOffers } from "@/lib/db/actions/offer.action";

export default async function TicketsPage() {
  const offersResult = await getActiveOffers();
  const offers =
    offersResult.success && offersResult.data ? offersResult.data : [];

  return <TicketsPageClient offers={offers} />;
}
