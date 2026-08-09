import AboutSection from "./components/about-section";
import Hero from "./components/hero-section";
import SpeakersSection from "./components/speakers-section";
import CountdownTimer from "./components/countdown-timer";
import { getAllSponsors } from "@/lib/db/actions/sponsor.action";
import SponsorsSponsorsSection from "./components/sponsors/sponsors-sponsors-section";
import SponsorsPartnersSection from "./components/sponsors/sponsors-partners-section";
import FloatingOfferBanner from "./components/floating-offer-banner";
// import OfferBanner from "@/components/offer-banner";

import { auth } from "@/auth";
import TheaterParallax from "./components/theater-parallex";

const Home = async () => {
  const session = await auth();

  const [sponsorsResult, partnersResult] = await Promise.all([
    getAllSponsors({ type: "sponsor" }),
    getAllSponsors({ type: "partner" }),
  ]);

  const sponsors = sponsorsResult.success ? sponsorsResult.data?.items : [];
  const partners = partnersResult.success ? partnersResult.data?.items : [];

  return (
    <div className="relative">
      <Hero session={session} />

      <AboutSection />

      <TheaterParallax />

      <SpeakersSection hideKeyholders />

      {/* <SponsorsSection sponsors={sponsors || []} /> */}

      <SponsorsSponsorsSection sponsors={sponsors || []} />

      <SponsorsPartnersSection partners={partners || []} />

      {/* <CTA /> */}
      <CountdownTimer />

      <FloatingOfferBanner />
      {/* <OfferBanner /> */}
    </div>
  );
};

export default Home;
