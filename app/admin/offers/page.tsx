import AdminOffersClient from "@/components/admin/admin-offers-client";
import { listOffers } from "@/lib/db/actions/offer.action";

export default async function AdminOffersPage() {
  const result = await listOffers();
  const items = result.success && result.data ? result.data.items : [];

  return <AdminOffersClient items={items} />;
}
