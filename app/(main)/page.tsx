import Preloader from "@/components/Preloader";
import AboutSection from "./components/about-section";
import Hero from "./components/hero-section";
import SpeakersSection from "./components/speakers-section";
import SponsorsCTA from "./components/sponsors-cta";
// import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CountdownTimer from "./components/countdown-timer";
import SponsorsSection from "./components/sponsors-section";
import CTA from "./components/cta-section";

const Home = () => {

  //   const [isLoading, setIsLoading] = useState(true);

  // useEffect( () => {
  //   (
  //     async () => {
  //         const LocomotiveScroll = (await import('locomotive-scroll')).default
  //         const locomotiveScroll = new LocomotiveScroll();

  //         setTimeout( () => {
  //           setIsLoading(false);
  //           document.body.style.cursor = 'default'
  //           window.scrollTo(0,0);
  //         }, 2000)
  //     }
  //   )()
  // }, [])
  return (
    <div className="">

      {/* <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence> */}
      <Hero />


      <AboutSection />

      <SpeakersSection />

      <SponsorsSection />

      {/* <CTA /> */}
      <CountdownTimer />
    </div>
  );
};

export default Home;
