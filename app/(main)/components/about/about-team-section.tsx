"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import {
  teamDepartments,
  type StandardTeamDepartment,
} from "@/constants/team";
import { cn } from "@/lib/utils";
import { AboutSectionHeader } from "./about-section-header";
import { TeamMemberCard } from "./team-member-card";

gsap.registerPlugin(ScrollTrigger);

function getMemberGridClass(count: number) {
  if (count === 1) {
    return " grid max-w-md grid-cols-1";
  }
  if (count === 2) {
    return " grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5";
  }
  if (count === 3) {
    return "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3";
  }
  return "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4";
}

function DepartmentHeader({
  index,
  name,
  description,
}: {
  index: number;
  name: string;
  description: string;
}) {
  return (
    <div className="ab-dept-header mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:gap-6">
      <div className="flex items-center gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10   text-sm font-black text-primary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="  text-xl font-extrabold  tracking-tight text-foreground sm:text-2xl md:text-3xl">
            {name}
          </h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="hidden h-px flex-1 bg-linear-to-r from-primary/25 to-transparent sm:block" />
    </div>
  );
}

function StandardDepartmentBlock({
  department,
  index,
}: {
  department: StandardTeamDepartment;
  index: number;
}) {
  const isCompact = department.members.length === 1;
  return (
    <div className="ab-dept-block mb-16 last:mb-0 sm:mb-20">
      <DepartmentHeader
        index={index}
        name={department.name}
        description={department.description}
      />
      <div className={getMemberGridClass(department.members.length)}>
        {department.members.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            compact={isCompact}
          />
        ))}
      </div>
    </div>
  );
}

export default function AboutTeamSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const blocks = gsap.utils.toArray<HTMLElement>(".ab-dept-block");
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative border-t border-border/80 bg-muted/10 py-16 sm:py-20 md:py-28",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AboutSectionHeader
          eyebrow="The team"
          title={
            <>
              Meet the <span className="text-primary">light bearers</span>
            </>
          }
          description="The humans behind TEDxNewCairoSTEMYouth—organized by department, each one a vital part of the light."
        />

        <div className="mt-4">
          {teamDepartments.map((department, index) => (
            <StandardDepartmentBlock
              key={department.id}
              department={department}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
