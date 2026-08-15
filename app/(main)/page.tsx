import AboutSection from "./components/about-section";
import Hero from "./components/hero-section";
import EventInfoSection from "./components/event-info-section";
import WhyAttendSection from "./components/why-attend-section";
import ThemeExplanationSection from "./components/theme-explanation-section";
import ScheduleSection from "./components/schedule-section";
import FinalCTASection from "./components/final-cta-section";
import SpeakersSection from "./components/speakers-section";
import CountdownTimer from "./components/countdown-timer";
import { getAllSponsors } from "@/lib/db/actions/sponsor.action";
import SponsorsSponsorsSection from "./components/sponsors/sponsors-sponsors-section";
import SponsorsPartnersSection from "./components/sponsors/sponsors-partners-section";
import FloatingOfferBanner from "./components/floating-offer-banner";
// import OfferBanner from "@/components/offer-banner";

import TheaterParallax from "./components/theater-parallex";

const Home = async () => {
  const [sponsorsResult, partnersResult] = await Promise.all([
    getAllSponsors({ type: "sponsor" }),
    getAllSponsors({ type: "partner" }),
  ]);

  const sponsors = sponsorsResult.success ? sponsorsResult.data?.items : [];
  const partners = partnersResult.success ? partnersResult.data?.items : [];

  return (
    <div className="relative">
      <Hero />

      <EventInfoSection />

      <TheaterParallax />
      <WhyAttendSection />

      <AboutSection />

      <SpeakersSection hideKeyholders />

      {/* <ScheduleSection /> */}

      {/* <SponsorsSection sponsors={sponsors || []} /> */}

      <SponsorsSponsorsSection sponsors={sponsors || []} />

      {/* <ThemeExplanationSection /> */}
      <SponsorsPartnersSection partners={partners || []} />

      {/* <CTA /> */}
      <CountdownTimer />

      <FinalCTASection />

      <FloatingOfferBanner />
      {/* <OfferBanner /> */}
    </div>
  );
};

export default Home;
