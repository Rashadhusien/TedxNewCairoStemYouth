"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { confirmedSponsorsList } from "@/constants/sponsors-page";
import { SponsorsSectionHeader } from "./sponsors-section-header";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsSponsorsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, scale: 0.94 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative border-b border-border/80 bg-muted/15 py-16 sm:py-20 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SponsorsSectionHeader
          eyebrow="Confirmed sponsors"
          title={
            <>
              Backing the <span className="text-primary">future</span>
            </>
          }
          description="Organizations investing in Egypt's next generation of STEM leaders through official sponsorship."
        />

        <div
          ref={gridRef}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:gap-6"
        >
          {confirmedSponsorsList.map((sponsor) => (
            <article
              key={sponsor.id}
              className="group relative flex flex-col items-center rounded-xl border border-border bg-card/80 px-8 py-10 text-center transition-all duration-300 hover:border-primary/35 hover:bg-card hover:shadow-[0_0_40px_color-mix(in_oklch,var(--primary)_12%,transparent)] sm:px-10 sm:py-12"
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />
              <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                {sponsor.tier}
              </span>
              <div className="mb-6 flex size-24 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-3xl font-black text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/10">
                {sponsor.initials}
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                {sponsor.name}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {sponsor.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
