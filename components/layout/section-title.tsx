"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { splitText } from "@/hooks/use-split-text";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface sectionTitleProps {
  eyebrow: string;
  title: string;
  subTitle: string;
}

const SectionTitle = ({ eyebrow, title, subTitle }: sectionTitleProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      // ── 1. Split DOM first, before any GSAP timeline is created ──
      //    This way the layout mutation happens before ScrollTrigger
      //    measures anything, and tweens get correct start times.
      const titleEl = ref.current.querySelector<HTMLElement>(".st-title");
      const descEl = ref.current.querySelector<HTMLElement>(".st-desc");

      const titleInners = titleEl ? splitText(titleEl, "lines").inners : [];
      const descInners = descEl ? splitText(descEl, "words").inners : [];

      // ── 2. Set initial states immediately after split ──
      //    Prevents flash of unstyled content on fast scrolls
      gsap.set(".st-badge", { opacity: 0, y: -14 });
      if (titleInners.length) gsap.set(titleInners, { yPercent: 110 });
      if (descInners.length)
        gsap.set(descInners, { yPercent: 100, opacity: 0 });

      // ── 3. Now build the timeline — DOM is stable, no more mutations ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 70%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(".st-badge", { opacity: 1, y: 0, duration: 0.45 });

      if (titleInners.length) {
        tl.to(
          titleInners,
          {
            yPercent: 0,
            duration: 0.85,
            stagger: 0.12,
          },
          "-=0.2",
        );
      }

      if (descInners.length) {
        tl.to(
          descInners,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.03,
          },
          "-=0.4",
        );
      }
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="max-w-6xl mx-auto text-center">
      <div className="st-badge mb-2 flex items-center justify-center gap-2">
        <span className="block h-px w-12 bg-primary" />
        <p className="font-medium uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <span className="block h-px w-12 bg-primary" />
      </div>
      <div>
        <h2 className="st-title text-4xl  font-extrabold  leading-tight text-foreground sm:text-5xl md:text-6xl">
          {title}
        </h2>
      </div>
      <div className="mt-4">
        <p className="st-desc text-lg text-muted-foreground">{subTitle}</p>
      </div>
    </div>
  );
};

export default SectionTitle;
