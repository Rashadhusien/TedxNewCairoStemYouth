"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { SPONSOR_CONTACT_EMAIL } from "@/constants/sponsors-page";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsCtaSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="pb-20 pt-4 sm:pb-28 md:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-br from-primary/15 via-card to-card px-6 py-12 sm:px-10 sm:py-14 md:px-14 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-[80px]"
          />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">
                Ready to partner?
              </p>
              <h2 className="mt-3   text-3xl font-extrabold uppercase leading-tight text-foreground sm:text-4xl md:text-5xl">
                Join the Luminous Quest
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Limited slots remain across our 2026 partnership tiers. Connect
                with our team to secure your Interaction Hub and lead-generation
                package.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 px-8 text-xs font-bold uppercase tracking-[0.18em]"
              >
                <Link href={`mailto:${SPONSOR_CONTACT_EMAIL}`}>
                  <Mail className="size-4" aria-hidden />
                  Contact partnerships
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 gap-2 border-border px-8 text-xs font-bold uppercase tracking-[0.18em]"
              >
                <Link href={ROUTES.ABOUT}>
                  About Us
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
