import AdminCouponsClient from "@/components/admin/admin-coupons-client";
import { listCoupons } from "@/lib/db/actions/coupon.action";

export default async function AdminCouponsPage() {
  const result = await listCoupons();
  const items = result.success && result.data ? result.data.items : [];

  return <AdminCouponsClient items={items} />;
}
