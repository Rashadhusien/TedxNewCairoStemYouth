"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { Check } from "lucide-react";

import {
  SPONSOR_CONTACT_EMAIL,
  sponsorshipTiers,
} from "@/constants/sponsors-page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SponsorsSectionHeader } from "./sponsors-section-header";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsTiersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 88%",
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
      className="relative overflow-hidden border-t border-border/80 bg-muted/10 py-16 sm:py-20 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)]"
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <SponsorsSectionHeader
          eyebrow="Partnership architecture"
          title={
            <>
              Financial <span className="text-primary">packages</span>
            </>
          }
          description="Transparent tiers designed for brands at every stage—from national category leaders to emerging STEM-aligned partners."
        />

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {sponsorshipTiers.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border p-6 transition-shadow duration-300 sm:p-7",
                tier.borderClass,
                tier.bgClass,
                tier.featured &&
                  "ring-1 ring-primary/30 shadow-lg shadow-primary/5",
              )}
              style={
                {
                  ["--tier-accent" as string]: tier.accent,
                } as React.CSSProperties
              }
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)`,
                }}
                aria-hidden
              />
              {tier.featured ? (
                <span className="mb-3 inline-flex w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Flagship tier
                </span>
              ) : null}
              <h3
                className={cn(
                  "  text-2xl font-extrabold  tracking-tight sm:text-2xl",
                  tier.featured ? "text-primary" : "text-foreground",
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
                {tier.price}
              </p>
              <p
                className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: tier.accent }}
              >
                {tier.badge}
              </p>

              <ul className="mt-6 flex-1 space-y-3 border-t border-border/60 pt-6">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: tier.accent }}
                      aria-hidden
                    />
                    <span className="text-sm leading-snug text-muted-foreground">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant="outline"
                className="mt-8 h-11 w-full border-border/80 text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:border-[var(--tier-accent)] hover:text-[var(--tier-accent)]"
              >
                <Link href={`mailto:${SPONSOR_CONTACT_EMAIL}`}>
                  Inquire now
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-[11px] leading-relaxed text-muted-foreground">
          * All attendee data is shared in full compliance with Egyptian
          Personal Data Protection Law (Law No. 151 of 2020) and GDPR-standard
          privacy protocols.
        </p>
      </div>
    </section>
  );
}
