"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import {
  teamDepartments,
  type HubTeamDepartment,
  type StandardTeamDepartment,
  type TeamDepartment,
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
  return (
    <div className="ab-dept-block mb-16 last:mb-0 sm:mb-20">
      <DepartmentHeader
        index={index}
        name={department.name}
        description={department.description}
      />
      <div className={getMemberGridClass(department.members.length)}>
        {department.members.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

function HubDepartmentBlock({
  department,
  index,
}: {
  department: HubTeamDepartment;
  index: number;
}) {
  return (
    <div className="ab-dept-block mb-16 last:mb-0 sm:mb-20">
      <DepartmentHeader
        index={index}
        name={department.name}
        description={department.description}
      />

      <div className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card/80 to-card p-1 sm:mb-10">
     
        <TeamMemberCard
          member={department.lead}
          variant="lead"
          className="border-0 bg-transparent shadow-none hover:border-0"
        />
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-8 xl:grid-cols-3 xl:gap-6">
        {department.subDepartments.map((sub) => (
          <div
            key={sub.id}
            className="flex flex-col rounded-xl border border-border bg-muted/20 p-5 sm:p-6"
          >
            <div className="mb-5 border-b border-border/80 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                Sub-department
              </p>
              <h4 className="mt-1   text-lg font-bold  tracking-tight text-foreground sm:text-xl">
                {sub.name}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {sub.description}
              </p>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                {sub.members.length} member
                {sub.members.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              {sub.members.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderDepartment(department: TeamDepartment, index: number) {
  if (department.type === "hub") {
    return (
      <HubDepartmentBlock
        key={department.id}
        department={department}
        index={index}
      />
    );
  }

  return (
    <StandardDepartmentBlock
      key={department.id}
      department={department}
      index={index}
    />
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
          description="The humans behind TEDxNewCairoSTEMYouth—organized by department, with Social Media uniting creative, video, and content under one strategic hub."
        />

        <div className="mt-4">{teamDepartments.map(renderDepartment)}</div>
      </div>
    </section>
  );
}
