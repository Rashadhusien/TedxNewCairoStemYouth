import AboutSection from "./components/about-section";
import Hero from "./components/hero-section";
import SpeakersSection from "./components/speakers-section";
import CountdownTimer from "./components/countdown-timer";
import SponsorsSection from "./components/sponsors-section";

const Home = () => {
  return (
    <div className="">
      <Hero />

      <AboutSection />

      <SpeakersSection hideKeyholders />

      <SponsorsSection />

      {/* <CTA /> */}
      <CountdownTimer />
    </div>
  );
};

export default Home;
