import SectionTitle from "@/components/layout/section-title";
import MissionVissionSection from "../components/mission-vission-section";
import SpeakersSection from "../components/speakers-section";
import SponsorsSection from "../components/sponsors-section";
import TheaterParallax from "../components/theater-parallex";
import ThemeSection from "../components/theme-section";
import { getAllSponsors } from "@/lib/db/actions/sponsor.action";
export const metadata = {
  title: "Event 2026",
  description:
    "Explore TEDxNewCairoSTEMYouth 2026, featuring inspiring speakers, innovative ideas, and the Luminous Darkness experience.",
};
const Event = async () => {
  const result = await getAllSponsors({ type: "sponsor" });

  const sponsors = result.success ? result.data?.items : [];
  return (
    <div className=" pt-24">
      <SectionTitle
        eyebrow="Event"
        title="Event 2026"
        subTitle="The TEDxNewCairoSTEMYouth 2026 event will be held on July 31, 2026, at Hilton Nile Maadi — Grand Ballroom & Conference Hall."
      />

      <MissionVissionSection />

      <ThemeSection />

      {/* <TheaterParallax /> */}

      <SpeakersSection hideExploreLink={true} />

      <SponsorsSection sponsors={sponsors || []} />
    </div>
  );
};

export default Event;
