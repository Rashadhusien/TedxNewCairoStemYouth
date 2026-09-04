"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { SponsorsSectionHeader } from "./sponsors-section-header";
import Image from "next/image";
import { SponsorsWithRelations } from "@/types/sponsor";
import { getInitials } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsPartnersSection({
  partners,
}: {
  partners: SponsorsWithRelations[];
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
          eyebrow="Confirmed partners"
          title={
            <>
              who measure the <span className="text-primary">light</span>
            </>
          }
          description="Organizations partnering to measure the light and support the next generation of STEM leaders and changemakers through strategic partnerships."
        />

        <div
          ref={gridRef}
          className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {partners &&
            partners.length > 0 &&
            partners.map((partner) => (
              <article
                key={partner.id}
                className="group relative flex flex-col items-center rounded-xl border border-white/10 bg-white/2 px-6 py-8 text-center transition-all duration-300 hover:border-primary/40 hover:bg-white/4 sm:px-8 sm:py-10"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="size-24 rounded-full overflow-hidden border border-primary/20 bg-primary/8 group-hover:bg-primary/15 group-hover:border-primary/55 flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={96}
                      height={96}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary/60 group-hover:text-primary transition-colors duration-300">
                      {getInitials(partner.name)}
                    </span>
                  )}
                </div>
                <h3 className="text-md sm:text-xl font-bold sm:uppercase tracking-tight text-white md:text-2xl">
                  {partner.name}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                  {partner.description}
                </p>
              </article>
            ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-white/40">
          Additional partnership slots across Strategic Partner, Gold, Silver,
          and Custom Package tiers are open for the 2026 edition.
        </p>
      </div>
    </section>
  );
}
