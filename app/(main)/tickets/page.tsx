import SectionTitle from "@/components/layout/section-title";
import TicketsPageClient from "@/components/tickets/tickets-page-client";
import { getActivePackages } from "@/lib/db/actions/package.action";

export default async function TicketsPage() {
  const packages = await getActivePackages();

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black via-[#0a0000] to-black pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="relative px-6">
          <SectionTitle
            eyebrow="Event Access"
            title="Get Your Ticket"
            subTitle="Choose your package and complete secure payment to secure your spot at Luminous Darkness 2026."
          />
        </div>
      </section>
      <TicketsPageClient packages={packages} />
    </div>
  );
}
