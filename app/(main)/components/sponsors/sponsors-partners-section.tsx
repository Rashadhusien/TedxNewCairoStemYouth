"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { sponsorPartners } from "@/constants/sponsors-page";
import { SponsorsSectionHeader } from "./sponsors-section-header";
import { confirmedSponsors } from "@/constants";
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
    <section
      ref={sectionRef}
      className="relative border-y border-border/80 bg-muted/15 py-16 sm:py-20 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SponsorsSectionHeader
          eyebrow="Confirmed partners"
          title={
            <>
              who measure the <span className="text-primary">light</span>
            </>
          }
          description=" next generation of STEM leaders and changemakers."
        />

        <div
          ref={gridRef}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 5 sm:gap-6"
        >
          {partners &&
            partners.length > 0 &&
            partners.map((partner) => (
              <article
                key={partner.id}
                className="group relative flex flex-col items-center rounded-xl border border-border bg-card/80 px-8 py-10 text-center transition-all duration-300 hover:border-primary/35 hover:bg-card hover:shadow-[0_0_40px_color-mix(in_oklch,var(--primary)_12%,transparent)] sm:px-10 sm:py-12"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                {/* <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                {partner.tier}
              </span> */}
                {partner.logoUrl ? (
                  <div className="mb-6 flex size-24 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-3xl font-black text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/10">
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <div className="mb-6 flex size-24 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-3xl font-black text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/10">
                    {getInitials(partner.name)}
                  </div>
                )}
                <h3 className="  text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                  {partner.name}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {partner.description}
                </p>
              </article>
            ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          Additional partnership slots across Strategic Partner, Gold, Silver,
          and Custom Package tiers are open for the 2026 edition.
        </p>
      </div>
    </section>
  );
}
