"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";

import { sponsorRoiPoints, sponsorRoiStats } from "@/constants/sponsors-page";
import { SponsorsSectionHeader } from "./sponsors-section-header";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsRoiSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".sp-roi-copy > *",
        { opacity: 0, x: -32 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        },
      );

      if (visualRef.current) {
        gsap.fromTo(
          visualRef.current.children,
          { opacity: 0, y: 24, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: visualRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative  bg-muted/20 py-16 sm:py-20 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent)]"
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="sp-roi-copy">
            <SponsorsSectionHeader
              align="left"
              eyebrow="The data advantage"
              title={
                <>
                  Measurable reach & <span className="text-primary">ROI</span>
                </>
              }
              description="Hosted at Galal El Sharkawy - down town cairo, our venue is equipped with 6 auxiliary screens, main LED stage, and premium exhibition halls. Partners leave with a comprehensive digital report of pre-qualified leads, fully compliant with Egypt Data Law 151/2020."
              className="mb-0"
            />
            <ul className="mt-8 space-y-4">
              {sponsorRoiPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div ref={visualRef} className="grid grid-cols-2 gap-3 sm:gap-4">
            {sponsorRoiStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/80 p-5 transition-colors hover:border-primary/30 hover:bg-card sm:p-6"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden
                />
                <p className="text-xl font-black tabular-nums leading-none text-foreground sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-bold uppercase  text-primary">
                  {stat.label}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
