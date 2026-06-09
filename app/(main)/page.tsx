import AboutSection from "./components/about-section";
import Hero from "./components/hero-section";
import SpeakersSection from "./components/speakers-section";
import CountdownTimer from "./components/countdown-timer";
import SponsorsSection from "./components/sponsors-section";
import OffersBanner from "@/components/tickets/offers-banner";
import { getActiveOffers } from "@/lib/db/actions/offer.action";

const Home = async () => {
  const offersResult = await getActiveOffers(true);
  const featuredOffers =
    offersResult.success && offersResult.data ? offersResult.data : [];


  return (
    <div className="">
    
      <Hero />

      {featuredOffers.length > 0 && (
        <section className="relative py-12 px-6 max-w-6xl mx-auto">
          <OffersBanner offers={featuredOffers} />
        </section>
      )}

      <AboutSection />

      <SpeakersSection hideKeyholders />

      <SponsorsSection />

      {/* <CTA /> */}
      <CountdownTimer />
    </div>
  );
};

export default Home;
