"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { SponsorsSectionHeader } from "./sponsors-section-header";
import { SponsorsWithRelations } from "@/types/sponsor";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsSponsorsSection({
  sponsors,
}: {
  sponsors: SponsorsWithRelations[];
}) {
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
    <section ref={sectionRef} className="relative py-20 px-6 lg:px-10 bg-black">
      <div className="absolute inset-0 bg-linear-to-b from-[#050505] via-black to-[#050000] pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-red-950/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
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
          className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {sponsors &&
            sponsors.map((sponsor) => (
              <article
                key={sponsor.id}
                className="group relative flex flex-col items-center rounded-xl border border-white/10 bg-white/2 px-6 py-8 text-center transition-all duration-300 hover:border-primary/40 hover:bg-white/4 sm:px-8 sm:py-10"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                  {sponsor.tier}
                </span>
                <div className="size-24 rounded-full overflow-hidden border border-primary/20 bg-primary/8 group-hover:bg-primary/15 group-hover:border-primary/55 flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                  {sponsor.logoUrl ? (
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      width={96}
                      height={96}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary/60 group-hover:text-primary transition-colors duration-300">
                      {getInitials(sponsor.name)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white sm:text-2xl">
                  {sponsor.name}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                  {sponsor.description}
                </p>
              </article>
            ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-white/40">
          Additional sponsorship slots across Strategic Partner, Gold, Silver,
          and Custom Package tiers are open for the 2026 edition.
        </p>
      </div>
    </section>
  );
}
