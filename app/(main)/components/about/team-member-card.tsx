"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Phone, RotateCcw } from "lucide-react";

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
  compact?: boolean;
  className?: string;
};

function SocialLinks({
  member,
  links,
}: {
  member: TeamMember;
  links: ReturnType<typeof getMemberSocialLinks>;
}) {
  if (links.length === 0) return null;
  return (
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
            onClick={(e) => e.stopPropagation()}
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
  );
}

export function TeamMemberCard({
  member,
  variant = "default",
  compact = false,
  className,
}: TeamMemberCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const links = getMemberSocialLinks(member.social);
  const initials = getMemberInitials(member.name);

  return (
    <article
      className={cn(
        "perspective-1000 cursor-pointer",
        variant === "lead" && "md:flex-row md:items-stretch",
        className,
      )}
      onClick={() => setIsFlipped((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Click to ${isFlipped ? "flip back" : "flip and read more about"} ${member.name}`}
    >
      <div
        className={cn(
          "preserve-3d relative transition-transform duration-500 ease-in-out",
          isFlipped && "flip-active",
          variant === "lead" ? "md:flex md:h-full" : "",
        )}
      >
        {/* Front Face */}
        <div
          className={cn(
            "backface-hidden relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/80 transition-colors hover:border-primary/30 hover:bg-card",
            variant === "lead" && "md:flex-row md:items-stretch",
          )}
        >
          <div
            className={cn(
              "relative shrink-0 overflow-hidden bg-muted",
              variant === "lead"
                ? "aspect-4/3 w-full md:aspect-auto md:w-[280px] lg:w-[320px]"
                : compact
                  ? "aspect-video w-full"
                  : "aspect-4/3 w-full",
            )}
          >
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full min-h-[120px] items-center justify-center bg-primary/5",
                  compact ? "min-h-[100px]" : "min-h-[200px]",
                )}
              >
                <span
                  className={cn(
                    "font-black text-primary/40",
                    compact ? "text-3xl" : "text-4xl",
                  )}
                >
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
              "flex flex-1 flex-col",
              compact ? "p-4 sm:p-5" : "p-5 sm:p-6",
              variant === "lead" && "md:py-8 md:pr-8",
            )}
          >
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.22em] text-primary",
                compact && "text-[9px]",
              )}
            >
              {member.role}
            </p>
            <h3
              className={cn(
                "mt-2 font-bold tracking-tight text-foreground",
                compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl",
              )}
            >
              {member.name}
            </h3>
            <p
              className={cn(
                "mt-3 flex-1 leading-relaxed text-muted-foreground line-clamp-3",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {member.description || "Description coming soon."}
            </p>

            <SocialLinks member={member} links={links} />
          </div>
        </div>

        {/* Back Face */}
        <div
          className={cn(
            "flip-back absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-primary/30 bg-card p-5 sm:p-6",
            variant === "lead" && "md:flex-row md:items-stretch",
          )}
        >
          <div className="flex flex-1 flex-col">
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.22em] text-primary",
                compact && "text-[9px]",
              )}
            >
              {member.role}
            </p>
            <h3
              className={cn(
                "mt-2 font-bold tracking-tight text-foreground",
                compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl",
              )}
            >
              {member.name}
            </h3>
            <p
              className={cn(
                "mt-3 flex-1 leading-relaxed text-muted-foreground",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {member.description || "Description coming soon."}
            </p>

            <SocialLinks member={member} links={links} />

            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
              <RotateCcw className="size-3" aria-hidden />
              <span>Click to flip back</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
