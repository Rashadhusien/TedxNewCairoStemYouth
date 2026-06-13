import AboutSection from "./components/about-section";
import Hero from "./components/hero-section";
import SpeakersSection from "./components/speakers-section";
import CountdownTimer from "./components/countdown-timer";
import SponsorsSection from "./components/sponsors-section";
import { getAllSponsors } from "@/lib/db/actions/sponsor.action";

const Home = async () => {
  const result = await getAllSponsors();

  const sponsors = result.success ? result.data?.items : [];

  return (
    <div className="">
      <Hero />

      <AboutSection />

      <SpeakersSection hideKeyholders />

      <SponsorsSection sponsors={sponsors || []} />

      {/* <CTA /> */}
      <CountdownTimer />
    </div>
  );
};

export default Home;
