"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { AboutSectionHeader } from "./about-section-header";

gsap.registerPlugin(ScrollTrigger);

export default function AboutTedxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".ab-tedx-copy > *",
        { opacity: 0, x: -28 },
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

      if (asideRef.current) {
        gsap.fromTo(
          asideRef.current,
          { opacity: 0, x: 28 },
          {
            opacity: 1,
            x: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: asideRef.current,
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
      className="relative border-y border-border/80 bg-muted/15 py-16 sm:py-20 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="ab-tedx-copy">
            <AboutSectionHeader
              align="left"
              eyebrow="About TEDx"
              title={
                <>
                  What is <span className="text-primary">TEDx?</span>
                </>
              }
              className="mb-6"
            />
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                In the spirit of ideas worth spreading, TED created a program
                called TEDx—local, self-organized events that bring people
                together for a TED-like experience.
              </p>
              <p>
                Our event is{" "}
                <span className="font-medium text-foreground">
                  TEDxNewCairoSTEMYouth
                </span>
                , where the{" "}
                <span className="text-primary font-semibold">x</span> means
                independently organized. TED Talks video and live speakers
                combine to spark deep discussion and connection.
              </p>
              <p>
                The TED Conference provides general guidance for the TEDx
                program, but individual TEDx events—including ours—are
                self-organized.
              </p>
            </div>
          </div>

          <aside
            ref={asideRef}
            className="relative overflow-hidden rounded-xl border border-border bg-card/70 p-8 sm:p-10"
          >
            <div
              className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent"
              aria-hidden
            />
            <p className="  text-6xl font-black leading-none text-primary/25 sm:text-7xl">
              TEDx
            </p>
            <blockquote className="mt-6 text-lg font-medium leading-snug text-foreground sm:text-xl">
              &ldquo;Ideas worth spreading—from minds that dare to think
              differently.&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                TED Foundation
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
