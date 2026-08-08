import { seedOffers } from "@/lib/db/actions/seed-offers.action";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = {
  title: "Seed Offers — Admin",
};

export default async function SeedOffersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Run the seed action
  const result = await seedOffers();

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-white">Seed Offers</h1>

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
                <p className="font-semibold">Offers seeded successfully!</p>
              </div>
              <p className="text-white/60">
                {result.data?.count} offer(s) were created or updated.
              </p>
              <div className="rounded-lg bg-black/50 p-4 text-sm text-white/40">
                <p className="font-medium text-white/60 mb-2">What was done:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Created Early Bird offer (300 EGP, was 350 EGP)</li>
                  <li>Created Flash Sale offer (280 EGP, was 350 EGP)</li>
                  <li>Updated existing offers to be featured with pricing</li>
                </ul>
              </div>
              <a
                href="/admin/offers"
                className="inline-block rounded-lg bg-[#e62b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e62b1e]/90"
              >
                View Offers
              </a>
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
                <p className="font-semibold">Failed to seed offers</p>
              </div>
              <pre className="rounded-lg bg-black/50 p-4 text-xs text-red-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-[#111111] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Alternative: Use Drizzle Studio
          </h2>
          <p className="mb-4 text-sm text-white/60">
            You can also manually update offers using Drizzle Studio:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-white/40">
            <li>Open Drizzle Studio (running at http://127.0.0.1:2618)</li>
            <li>Navigate to the offers table</li>
            <li>
              Edit offers to set:
              <ul className="ml-6 mt-1 list-disc list-inside text-white/30">
                <li>is_featured = true</li>
                <li>discounted_price = 30000 (for 300 EGP)</li>
                <li>original_price = 35000 (for 350 EGP)</li>
              </ul>
            </li>
            <li>Or run the SQL script at scripts/update-offers.sql</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
