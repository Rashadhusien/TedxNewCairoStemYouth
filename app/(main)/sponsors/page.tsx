// import type { Metadata } from "next";

// import SectionTitle from "@/components/layout/section-title";
// import SponsorsCtaSection from "../components/sponsors/sponsors-cta-section";
// import SponsorsHero from "../components/sponsors/sponsors-hero";
// import SponsorsJourneySection from "../components/sponsors/sponsors-journey-section";
// import SponsorsPartnersSection from "../components/sponsors/sponsors-partners-section";
// import SponsorsQuestSection from "../components/sponsors/sponsors-quest-section";
// import SponsorsRoiSection from "../components/sponsors/sponsors-roi-section";
// import SponsorsSponsorsSection from "../components/sponsors/sponsors-sponsors-section";
// import SponsorsTiersSection from "../components/sponsors/sponsors-tiers-section";
// import SponsorsSection from "../components/sponsors-section";
// import { getAllSponsors } from "@/lib/db/actions/sponsor.action";

// export const metadata = {
//   title: "Sponsors & Partners | TEDxNewCairoSTEMYouth",
//   description:
//     "Partner with TEDxNewCairoSTEMYouth 2026 and connect with Egypt's brightest STEM youth through impactful sponsorship opportunities at Luminous Darkness.",
// };

export default async function SponsorsPage() {
  // const [sponsorsResult, partnersResult] = await Promise.all([
  //   getAllSponsors({ type: "sponsor" }),
  //   getAllSponsors({ type: "partner" }),
  // ]);

  // const sponsors = sponsorsResult.success ? sponsorsResult.data?.items : [];
  // const partners = partnersResult.success ? partnersResult.data?.items : [];

  return (
    <div className="pt-24">
      {/* <SponsorsHero />
      <SponsorsRoiSection />
      <SponsorsQuestSection />
      <SponsorsSponsorsSection sponsors={sponsors || []} />
      <SponsorsPartnersSection partners={partners || []} />
      <SponsorsJourneySection />
      <SponsorsTiersSection />
      <SponsorsCtaSection /> */}
    </div>
  );
}
