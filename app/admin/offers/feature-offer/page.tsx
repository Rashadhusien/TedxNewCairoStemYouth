import { listOffers } from "@/lib/db/actions/offer.action";
import { updateOfferFeatured } from "@/lib/db/actions/seed-offers.action";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import type { Offer } from "@/lib/db/schema";

export const metadata = {
  title: "Feature Offers — Admin",
};

export default async function FeatureOfferPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const offerId = searchParams.id;

  if (!offerId) {
    // List all offers
    const result = await listOffers({ page: 1, pageSize: 50, status: "all" });

    return (
      <div className="min-h-screen bg-[#0a0a0a] py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold text-white">Feature Offers</h1>

          <div className="rounded-xl border border-white/10 bg-[#111111] p-6">
            <p className="mb-4 text-sm text-white/60">
              Select an offer to mark it as featured (will appear on homepage):
            </p>

            {result.success && result.data?.items.length ? (
              <div className="space-y-3">
                {result.data.items.map((offer: Offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-black/50 p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {offer.title}
                      </h3>
                      <p className="text-sm text-white/40">
                        {offer.type} •{" "}
                        {offer.isFeatured ? "✓ Featured" : "Not featured"}
                      </p>
                      {offer.discountedPrice && (
                        <p className="text-sm text-white/40">
                          {offer.discountedPrice / 100} EGP
                          {offer.originalPrice &&
                            ` (was ${offer.originalPrice / 100} EGP)`}
                        </p>
                      )}
                    </div>
                    <a
                      href={`/admin/offers/feature-offer?id=${offer.id}`}
                      className="rounded-lg bg-[#e62b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e62b1e]/90"
                    >
                      {offer.isFeatured ? "Update" : "Feature"}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40">
                No offers found. Create an offer first.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Feature the specific offer
  const result = await updateOfferFeatured(offerId, {
    isFeatured: true,
    discountedPrice: 30000,
    originalPrice: 35000,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-white">Feature Offer</h1>

        <div className="rounded-xl border border-white/10 bg-[#111111] p-6">
          {result.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="font-semibold">Offer featured successfully!</p>
              </div>
              <p className="text-white/60">
                The offer is now featured and will appear on the homepage.
              </p>
              <div className="flex gap-3">
                <a
                  href="/admin/offers/feature-offer"
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  View All Offers
                </a>
                <Link
                  href="/"
                  className="rounded-lg bg-[#e62b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e62b1e]/90"
                >
                  View Homepage
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="font-semibold">Failed to feature offer</p>
              </div>
              <pre className="rounded-lg bg-black/50 p-4 text-xs text-red-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
