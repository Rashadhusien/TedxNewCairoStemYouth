import SectionTitle from "@/components/layout/section-title";
import AboutHeroStrip from "../components/about/about-hero-strip";
import AboutStorySection from "../components/about/about-story-section";
import AboutTeamSection from "../components/about/about-team-section";
import AboutTedxSection from "../components/about/about-tedx-section";

export const metadata = {
  title: "About Us | TEDxNewCairoSTEMYouth",
  description:
    "Learn more about TEDxNewCairoSTEMYouth, our mission, vision, and commitment to empowering Egypt's future leaders. Discover the team behind Luminous Darkness 2026.",
};

export default function AboutPage() {
  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
        <SectionTitle
          eyebrow="humans behind light"
          title="About Us"
          subTitle=" TED—where ideas worth spreading meet the next generation of Egyptian innovators."
        />
      </div>

      <AboutHeroStrip />
      <AboutTedxSection />
      <AboutStorySection />
      <AboutTeamSection />
    </div>
  );
}
