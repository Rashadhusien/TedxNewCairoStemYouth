"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ExternalLink, Phone } from "lucide-react";

import type { TeamMember } from "@/constants/team";
import {
  getMemberInitials,
  getMemberSocialLinks,
} from "@/lib/team/social-links";
import { cn } from "@/lib/utils";

const linkAbbrev: Record<string, string> = {
  linkedin: "in",
  instagram: "ig",
  facebook: "fb",
  tiktok: "tt",
  behance: "be",
  portfolio: "www",
  phone: "tel",
};

type TeamMemberCardProps = {
  member: TeamMember;
  variant?: "default" | "lead";
  className?: string;
};

export function TeamMemberCard({
  member,
  variant = "default",
  className,
}: TeamMemberCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const links = getMemberSocialLinks(member.social);
  const initials = getMemberInitials(member.name);

 

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative max-h-[600px] flex flex-col overflow-hidden rounded-xl border border-border bg-card/80 transition-colors hover:border-primary/30 hover:bg-card",
        variant === "lead" && "md:flex-row md:items-stretch",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted",
          variant === "lead"
            ? "aspect-4/3 w-full md:aspect-auto md:w-[280px] lg:w-[320px]"
            : "aspect-4/3 w-full",
        )}
      >
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            // sizes={
            //   variant === "lead"
            //     ? "(max-width: 768px) 100vw, 320px"
            //     : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            // }
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center bg-primary/5">
            <span className="  text-4xl font-black text-primary/40">
              {initials}
            </span>
          </div>
        )}
        <div
          className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent opacity-90"
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col p-5 sm:p-6",
          variant === "lead" && "md:py-8 md:pr-8",
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
          {member.role}
        </p>
        <h3 className="mt-2   text-xl font-bold  tracking-tight text-foreground sm:text-2xl">
          {member.name}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {member.description}
        </p>

        {links.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border/80 pt-4">
            {links.map((link) => {
              const isExternal = link.key !== "phone";
              const abbrev = linkAbbrev[link.key] ?? "↗";

              return (
                <Link
                  key={link.key}
                  href={link.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border text-[10px] font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  aria-label={`${member.name} on ${link.label}`}
                  title={link.label}
                >
                  {link.key === "phone" ? (
                    <Phone className="size-3.5" aria-hidden />
                  ) : link.key === "portfolio" ? (
                    <ExternalLink className="size-3.5" aria-hidden />
                  ) : (
                    <span aria-hidden>{abbrev}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}
