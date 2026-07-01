"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ROUTES } from "@/constants/routes";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [videoReady, setVideoReady] = useState(false);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Poster image shown until video can play */}
      <Image
        src="/images/hero-poster.jpeg"
        alt="hero-poster"
        fill
        priority
        className={`absolute -z-1 inset-0 object-cover aspect-auto will-change-[opacity,transform]  transition-opacity duration-700 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoReady(true)}
        className={`w-full absolute -z-1 inset-0 min-h-screen aspect-auto object-cover origin-center will-change-[opacity,transform] transition-opacity duration-700 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/hero-theater.mp4" type="video/mp4" />
      </video>

      <div
        ref={overlayRef}
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(220,38,38,0.18) 0%, transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="container mx-auto flex justify-center h-full">
        <div className="flex flex-col gap-4 mt-[140px] sm:mt-[160px] items-center">
          <div ref={badgeRef} className="">
            <div className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-white/55 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
              Visit Our —{" "}
              <Link
                href="https://www.ted.com/tedx/events/68964"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline inline-flex items-center gap-1 transition-opacity hover:opacity-80"
              >
                Official Page on TED <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>

          <h1
            ref={headingRef}
            className=" text-2xl sm:text-6xl  font-extrabold text-center leading-tight"
          >
            Without darkness <br />
            <span className="text-glow-white">Light </span> has no meaning.
          </h1>

          <p
            ref={paragraphRef}
            className=" text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-6 text-center text-white/70"
          >
            When others saw despair, we saw potential.{" "}
            <span className=" font-bold">TEDxNewCairoSTEMYouth</span>{" "}
            <br className="hidden sm:block" />
            exists to turn darkness into light and ideas into impact.
          </p>

          <div
            ref={buttonsRef}
            className=" grid grid-cols-2 gap-4 w-full max-w-md max-sm:px-4"
          >
            <Button
              className="py-6 sm:text-base cursor-pointer transition-transform active:scale-95"
              asChild
            >
              <Link href={ROUTES.TICKETS}>Get Your Ticket</Link>
            </Button>
            <Button
              className="py-6 sm:text-base transition-transform active:scale-95 "
              variant="outline"
              asChild
            >
              <Link href={ROUTES.SPONSORS}>Partner With Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
