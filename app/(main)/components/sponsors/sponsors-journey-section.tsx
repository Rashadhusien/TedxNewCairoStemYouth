"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { partnershipSteps } from "@/constants/sponsors-page";
import { SponsorsSectionHeader } from "./sponsors-section-header";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsJourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      if (!stepsRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        stepsRef.current.children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 86%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SponsorsSectionHeader
          eyebrow="How we partner"
          title={
            <>
              From first call to{" "}
              <span className="text-primary">post-event data</span>
            </>
          }
          description="A clear, professional partnership journey—structured like a TED-licensed event should be."
        />

        <ol
          ref={stepsRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
        >
          {partnershipSteps.map((item, index) => (
            <li
              key={item.step}
              className="relative rounded-xl border border-border bg-card/60 p-6 sm:p-7"
            >
              {index < partnershipSteps.length - 1 ? (
                <span
                  className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 bg-border lg:block"
                  aria-hidden
                />
              ) : null}
              <span className="text-[11px] font-bold tracking-[0.3em] text-primary/70">
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
