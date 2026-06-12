"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type SponsorsSectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SponsorsSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SponsorsSectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ref.current.children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: ref },
  );

  const alignClass =
    align === "center"
      ? "mx-auto max-w-3xl text-center"
      : "max-w-2xl text-left";

  return (
    <div ref={ref} className={`mb-10 md:mb-14 ${alignClass} ${className}`}>
      <div
        className={`mb-4 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-primary ${
          align === "center" ? "justify-center w-full" : ""
        }`}
      >
        <span className="block h-px w-8 shrink-0 bg-primary/60" aria-hidden />
        {eyebrow}
        <span className="block h-px w-8 shrink-0 bg-primary/60" aria-hidden />
      </div>
      <h2 className="  text-2xl font-extrabold  leading-[0.95] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
