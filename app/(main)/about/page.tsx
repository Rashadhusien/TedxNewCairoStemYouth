import type { Metadata } from "next";

import SectionTitle from "@/components/layout/section-title";
import AboutHeroStrip from "../components/about/about-hero-strip";
import AboutStorySection from "../components/about/about-story-section";
import AboutTeamSection from "../components/about/about-team-section";
import AboutTedxSection from "../components/about/about-tedx-section";

export const metadata: Metadata = {
  title: "About Us | TEDxNewCairoSTEMYouth",
  description:
    "Meet the team behind TEDxNewCairoSTEMYouth—an independently organized TEDx event licensed by TED, built for Egypt's brightest young STEM minds.",
};

export default function AboutPage() {
  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
        <SectionTitle
          eyebrow="The humans behind the light"
          title="About Us"
          subTitle="TEDxNewCairoSTEMYouth is independently organized under TED—where ideas worth spreading meet the next generation of Egyptian innovators."
        />
      </div>

      <AboutHeroStrip />
      <AboutTedxSection />
      <AboutStorySection />
      <AboutTeamSection />
    </div>
  );
}
