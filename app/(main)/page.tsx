import AboutSection from "./components/about-section";
import Hero from "./components/hero-section";
import SpeakersSection from "./components/speakers-section";
import CountdownTimer from "./components/countdown-timer";
import SponsorsSection from "./components/sponsors-section";
import { getAllSponsors } from "@/lib/db/actions/sponsor.action";
import SponsorsSponsorsSection from "./components/sponsors/sponsors-sponsors-section";
import SponsorsPartnersSection from "./components/sponsors/sponsors-partners-section";

const Home = async () => {
  const [sponsorsResult, partnersResult] = await Promise.all([
    getAllSponsors({ type: "sponsor" }),
    getAllSponsors({ type: "partner" }),
  ]);

  const sponsors = sponsorsResult.success ? sponsorsResult.data?.items : [];
  const partners = partnersResult.success ? partnersResult.data?.items : [];

  return (
    <div className="">
      <Hero />

      <AboutSection />

      <SpeakersSection hideKeyholders />

      {/* <SponsorsSection sponsors={sponsors || []} /> */}

      <SponsorsSponsorsSection sponsors={sponsors || []} />
      <SponsorsPartnersSection partners={partners || []} />

      {/* <CTA /> */}
      <CountdownTimer />
    </div>
  );
};

export default Home;
