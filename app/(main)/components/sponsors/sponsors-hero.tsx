"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Download, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  SPONSOR_CONTACT_EMAIL,
  sponsorDocuments,
  sponsorRoiStats,
} from "@/constants/sponsors-page";
import { cn } from "@/lib/utils";

export default function SponsorsHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".sp-hero-eyebrow",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6 },
      )
        .fromTo(
          ".sp-hero-title",
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.35",
        )
        .fromTo(
          ".sp-hero-lead",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.75 },
          "-=0.5",
        )
        .fromTo(
          ".sp-hero-actions > *",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          "-=0.4",
        )
        .fromTo(
          ".sp-hero-stat",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 },
          "-=0.25",
        );
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-border/80 pb-16 pt-8 sm:pb-20 md:pb-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="sp-hero-eyebrow mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
            An investment in Egypt&apos;s future
          </p>
          <h1 className="sp-hero-title   text-4xl font-extrabold uppercase leading-[0.92] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Sponsors &</span>
            <span className="block text-primary">Partners</span>
          </h1>
          <p className="sp-hero-lead mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Move beyond brand awareness. Partner with TEDxNewCairoSTEMYouth for
            unprecedented access, measurable ROI, and actionable intelligence on
            Egypt&apos;s brightest Gen-Z innovators.
          </p>

          <div className="sp-hero-actions mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {sponsorDocuments.map((doc) => (
              <Button
                key={doc.href}
                asChild
                size="lg"
                variant={doc.variant === "primary" ? "default" : "outline"}
                className={cn(
                  "h-11 gap-2 px-6 text-xs font-bold uppercase tracking-[0.18em]",
                  doc.variant === "outline" &&
                    "border-primary/40 bg-primary/5 hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <a href={doc.href} target="_blank" rel="noreferrer">
                  <Download className="size-4" aria-hidden />
                  {doc.label}
                </a>
              </Button>
            ))}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 gap-2 border-border px-6 text-xs font-bold uppercase tracking-[0.18em]"
            >
              <Link href={`mailto:${SPONSOR_CONTACT_EMAIL}`}>
                <Mail className="size-4" aria-hidden />
                Direct email
              </Link>
            </Button>
          </div>
        </div>

        <div className="sp-hero-stat mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          {sponsorRoiStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 bg-card px-4 py-6 text-center sm:px-6 sm:py-8"
            >
              <span className="text-2xl font-black tabular-nums leading-none tracking-tight text-primary sm:text-3xl md:text-4xl">
                {stat.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                {stat.label}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {stat.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
