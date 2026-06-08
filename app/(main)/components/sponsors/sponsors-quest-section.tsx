"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { luminousQuestFeatures } from "@/constants/sponsors-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { SponsorsSectionHeader } from "./sponsors-section-header";

gsap.registerPlugin(ScrollTrigger);

export default function SponsorsQuestSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardsRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 84%",
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
          eyebrow="Interactive engagement"
          title={
            <>
              The <span className="text-primary">Luminous Quest</span>
            </>
          }
          description="We replaced passive booths with an Interactive Engagement Engine so no brand is left in the shadows—every partner benefits from structured foot traffic and verified leads."
        />

        <div
          ref={cardsRef}
          className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6"
        >
          {luminousQuestFeatures.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="group relative gap-0 overflow-hidden border-border/80 bg-card/70 py-0 transition-colors hover:bg-card"
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden
              />
              <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
                <div className="flex size-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden />
                </div>
                <CardTitle className="text-lg font-semibold sm:text-xl">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {text}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-primary/25 bg-primary/5 px-6 py-8 text-center sm:px-10 sm:py-10">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            <span className="font-semibold text-foreground">
              How it works on the day:
            </span>{" "}
            attendees scan your hub QR code → earn Quest points → your team
            approves or rejects in real time → verified leads export after the
            event.
          </p>
        </div>
      </div>
    </section>
  );
}
