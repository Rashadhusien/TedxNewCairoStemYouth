"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { aboutStoryParagraphs } from "@/constants/team";
import { AboutSectionHeader } from "./about-section-header";

gsap.registerPlugin(ScrollTrigger);

export default function AboutStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!copyRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        copyRef.current.children,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: copyRef.current,
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_70%)]"
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <AboutSectionHeader
          eyebrow="Our story"
          title={
            <>
              How it all <span className="text-primary">began</span>
            </>
          }
        />

        <div
          ref={copyRef}
          className="mx-auto max-w-3xl space-y-6 text-center text-base leading-loose text-muted-foreground sm:text-lg"
        >
          {aboutStoryParagraphs.map((paragraph) => (
            <p
              key={paragraph.text.slice(0, 32)}
              className={
                paragraph.emphasis
                  ? "font-medium text-foreground"
                  : undefined
              }
            >
              {paragraph.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
