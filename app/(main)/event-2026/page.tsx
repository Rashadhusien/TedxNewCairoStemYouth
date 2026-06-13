import SectionTitle from "@/components/layout/section-title";
import MissionVissionSection from "../components/mission-vission-section";
import SpeakersSection from "../components/speakers-section";
import SponsorsSection from "../components/sponsors-section";
import TheaterParallax from "../components/theater-parallex";
import ThemeSection from "../components/theme-section";
export const metadata = {
  title: "Event 2026",
  description:
    "Explore TEDxNewCairoSTEMYouth 2026, featuring inspiring speakers, innovative ideas, and the Luminous Darkness experience.",
};
const Event = () => {
  return (
    <div className=" pt-24">
      <SectionTitle
        eyebrow="Event"
        title="Event 2026"
        subTitle="stay tuned for more updates"
      />

      <MissionVissionSection />

      <ThemeSection />

      {/* <TheaterParallax /> */}

      <SpeakersSection hideExploreLink={true} />

      <SponsorsSection />
    </div>
  );
};

export default Event;
