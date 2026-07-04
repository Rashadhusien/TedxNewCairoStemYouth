"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PILLARS } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.set(dividerRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        opacity: 0,
      });

      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      headerTl
        .fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
          "-=0.45",
        )
        .fromTo(
          leadRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
          "-=0.5",
        );

      gsap.fromTo(
        dividerRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: dividerRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );

      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );

      ScrollTrigger.refresh();
    },
    { dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-background pt-20 sm:pt-28 md:pt-36 pb-0"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="mb-12 md:mb-16 lg:mb-20">
          <div
            ref={eyebrowRef}
            className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-widest text-primary  sm:mb-6"
          >
            <span className="block h-px w-7 shrink-0 bg-primary" aria-hidden />
            About the event
          </div>

          <div className=" grid max-w-5xl grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
            <h2
              id="about-heading"
              ref={titleRef}
              className="text-2xl font-extrabold uppercase leading-[0.92] tracking-tight text-foreground  sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="">What is</span>{" "}
              <span className=" text-transparent [-webkit-text-stroke:1px_color-mix(in_oklch,var(--foreground)_55%,transparent)]">
                TEDx?
              </span>
            </h2>
            <div>
              <div ref={leadRef} className=" md:pb-1">
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
                  <span className="font-medium text-foreground">
                    TEDxNewCairoSTEMYouth
                  </span>{" "}
                  is an independently organized TEDx event licensed by TED —
                  bringing the spirit of ideas worth spreading to the heart of
                  New Cairo. We believe that{" "}
                  <span className="font-medium text-foreground">
                    every mind carries a spark
                  </span>
                  , and our stage exists to ignite it.
                </p>
              </div>
              {/* <div
                ref={statsRef}
                className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:mb-12 sm:grid-cols-3 md:mb-14"
              >
                {STATS.map(({ number, label }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1.5 bg-card px-6 py-6 sm:px-8 sm:py-8"
                  >
                    <span className="text-2xl font-black tabular-nums leading-none tracking-tight text-foreground sm:text-3xl">
                      {number}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div> */}
            </div>
          </div>
        </div>

        <div
          ref={cardsRef}
          className="mb-10 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 md:mb-14"
        >
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="group relative gap-0 overflow-hidden border-border/80 bg-card/80 py-0  ring-foreground/10 transition-colors hover:bg-card"
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden
              />
              <CardContent className="flex flex-col gap-4 p-6 sm:p-7">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-[18px]" aria-hidden />
                </div>
                <CardTitle className="text-base font-semibold text-foreground">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {text}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* 
          <blockquote
            ref={quoteRef}
            className="mb-10 rounded-r-xl border border-border border-l-[3px] border-l-primary bg-accent/30 px-6 py-7 sm:mb-12 sm:px-8 sm:py-9 md:mb-14"
          >
            <p className="text-xl font-bold uppercase leading-snug tracking-wide text-foreground sm:text-2xl md:text-3xl">
              &ldquo;Luminous Darkness&rdquo; — our theme for 2026 is a reminder
              that <span className="text-primary">light only has meaning</span>{" "}
              when it rises from the dark.
            </p>
            <footer className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              TEDxNewCairoSTEMYouth · Theme 2026
            </footer>
          </blockquote> */}
        {/* 
        <div
          ref={ctaRef}
          className="flex flex-col items-start justify-between gap-6 border-t border-border pt-8  sm:flex-row sm:items-center sm:pt-10"
        >
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Ready to be part of something that matters?{" "}
            <span className="font-medium text-foreground">
              Secure your seat before they&apos;re gone.
            </span>
          </p>
          <Button
            size="lg"
            className={cn(
              "h-11 w-full shrink-0 gap-2 px-7 text-sm font-semibold tracking-wide sm:w-auto",
            )}
          >
            Get Your Ticket
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div> */}
      </div>
    </section>
  );
}
