import SectionTitle from "@/components/layout/section-title";
import MissionVissionSection from "../components/mission-vission-section";
import SpeakersSection from "../components/speakers-section";
import TheaterParallax from "../components/theater-parallex";
import ThemeSection from "../components/theme-section";
import EventInfoSection from "../components/event-info-section";
import { getAllSponsors } from "@/lib/db/actions/sponsor.action";
import SponsorsSponsorsSection from "../components/sponsors/sponsors-sponsors-section";
import SponsorsPartnersSection from "../components/sponsors/sponsors-partners-section";
export const metadata = {
  title: "Event 2026",
  description:
    "Explore TEDxNewCairoSTEMYouth 2026, featuring inspiring speakers, innovative ideas, and the Luminous Darkness experience.",
};
const Event = async () => {
  const [sponsorsResult, partnersResult] = await Promise.all([
    getAllSponsors({ type: "sponsor" }),
    getAllSponsors({ type: "partner" }),
  ]);

  const sponsors = sponsorsResult.success ? sponsorsResult.data?.items : [];
  const partners = partnersResult.success ? partnersResult.data?.items : [];
  return (
    <div className=" pt-24">
      <SectionTitle
        eyebrow="Event"
        title="Event 2026"
        subTitle="Galal El Sharkawy - down town cairo"
      />

      <MissionVissionSection />
      <EventInfoSection />

      {/* <ThemeSection /> */}

      <TheaterParallax />

      <SpeakersSection hideExploreLink={true} />

      <SponsorsSponsorsSection sponsors={sponsors || []} />
      <SponsorsPartnersSection partners={partners || []} />
    </div>
  );
};

export default Event;
