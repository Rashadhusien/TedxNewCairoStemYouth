import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import SectionTitle from "@/components/layout/section-title";
import SponsorsCtaSection from "../components/sponsors/sponsors-cta-section";
import SponsorsHero from "../components/sponsors/sponsors-hero";
import SponsorsJourneySection from "../components/sponsors/sponsors-journey-section";
import SponsorsPartnersSection from "../components/sponsors/sponsors-partners-section";
import SponsorsQuestSection from "../components/sponsors/sponsors-quest-section";
import SponsorsRoiSection from "../components/sponsors/sponsors-roi-section";
import SponsorsSponsorsSection from "../components/sponsors/sponsors-sponsors-section";
import SponsorsTiersSection from "../components/sponsors/sponsors-tiers-section";

export const metadata: Metadata = {
  title: "Sponsors & Partners | TEDxNewCairoSTEMYouth",
  description:
    "Partner with TEDxNewCairoSTEMYouth for measurable ROI, verified Gen-Z STEM leads, and flagship visibility at Egypt's premier youth ideas conference.",
};

export default function SponsorsPage() {
  return (
    <div className="pt-24">
      {/* <div className="container mx-auto px-4 pb-10 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Partnerships"
          title="Sponsors & Partners"
          subTitle="An independently organized TEDx event—licensed by TED—built for brands that invest in ideas worth spreading and youth worth empowering."
        />
        <div className="flex items-center justify-center gap-2 mt-2">
          <MapPin className="size-3.5 text-primary/60" />
          <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
            Hilton Nile Maadi — Cairo
          </span>
        </div>
      </div> */}

      <SponsorsHero />
      <SponsorsRoiSection />
      <SponsorsQuestSection />
      {/* <SponsorsSponsorsSection /> */}
      <SponsorsPartnersSection />
      <SponsorsJourneySection />
      <SponsorsTiersSection />
      <SponsorsCtaSection />
    </div>
  );
}
