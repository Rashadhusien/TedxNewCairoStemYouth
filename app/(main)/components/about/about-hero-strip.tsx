"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { teamDepartments } from "@/constants/team";

const memberCount = teamDepartments.reduce(
  (total, dept) => total + dept.members.length,
  0,
);

export default function AboutHeroStrip() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".ab-hero-stat",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.15,
        },
      );
    },
    { scope: ref },
  );

  const stats = [
    { value: String(memberCount), label: "Team members" },
    { value: String(teamDepartments.length), label: "Departments" },
    { value: "2026", label: "Edition" },
    { value: "TEDx", label: "Licensed event" },
  ];

  return (
    <section
      ref={ref}
      className="border-b border-border/80 pb-12 pt-2 sm:pb-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ab-hero-stat mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center bg-card px-4 py-6 text-center sm:py-8"
            >
              <span className="text-2xl font-black tabular-nums text-primary sm:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
