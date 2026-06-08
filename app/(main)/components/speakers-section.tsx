"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { mainSpeakers, keyholders } from "@/constants/speakers";

gsap.registerPlugin(ScrollTrigger);

// Element glow colors mapping
const GLOW_COLORS: Record<string, string> = {
  fire: "rgba(230, 0, 0, 0.22)",
  water: "rgba(0, 102, 204, 0.22)",
  earth: "rgba(45, 106, 45, 0.22)",
  air: "rgba(136, 68, 204, 0.22)",
};

// Grid line texture background (matches the premium look)
function GridTexture() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px),
          repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px)
        `,
      }}
    />
  );
}

export default function SpeakersSection({
  hideExploreLink = false,
  hideKeyholders = false,
}: { hideExploreLink?: boolean; hideKeyholders?: boolean } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const mainGridRef = useRef<HTMLDivElement>(null);
  const keyholdersHeaderRef = useRef<HTMLDivElement>(null);
  const keyholdersGridRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Staggered scroll entrance animations
  // useGSAP(
  //   () => {
  //     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  //       // If reduced motion, just reveal elements immediately
  //       gsap.set(".animate-on-scroll", { opacity: 1, y: 0, scale: 1 });
  //       return;
  //     }

  //     // Header entrance
  //     if (headerRef.current) {
  //       gsap.fromTo(
  //         headerRef.current.children,
  //         { opacity: 0, y: 30 },
  //         {
  //           opacity: 1,
  //           y: 0,
  //           duration: 0.8,
  //           stagger: 0.15,
  //           ease: "power3.out",
  //           scrollTrigger: {
  //             trigger: headerRef.current,
  //             start: "top 85%",
  //             toggleActions: "play none none none",
  //           },
  //         }
  //       );
  //     }

  //     // Main Speakers Grid staggered reveal
  //     if (mainGridRef.current) {
  //       gsap.fromTo(
  //         mainGridRef.current.children,
  //         { opacity: 0, y: 50, scale: 0.95 },
  //         {
  //           opacity: 1,
  //           y: 0,
  //           scale: 1,
  //           duration: 0.9,
  //           stagger: 0.12,
  //           ease: "power3.out",
  //           scrollTrigger: {
  //             trigger: mainGridRef.current,
  //             start: "top 82%",
  //             toggleActions: "play none none none",
  //           },
  //         }
  //       );
  //     }

  //     // Keyholders Header entrance
  //     if (keyholdersHeaderRef.current) {
  //       gsap.fromTo(
  //         keyholdersHeaderRef.current.children,
  //         { opacity: 0, y: 25 },
  //         {
  //           opacity: 1,
  //           y: 0,
  //           duration: 0.75,
  //           stagger: 0.12,
  //           ease: "power2.out",
  //           scrollTrigger: {
  //             trigger: keyholdersHeaderRef.current,
  //             start: "top 85%",
  //             toggleActions: "play none none none",
  //           },
  //         }
  //       );
  //     }

  //     // Keyholders Grid staggered reveal
  //     if (keyholdersGridRef.current) {
  //       gsap.fromTo(
  //         keyholdersGridRef.current.children,
  //         { opacity: 0, scale: 0.93, y: 35 },
  //         {
  //           opacity: 1,
  //           scale: 1,
  //           y: 0,
  //           duration: 0.75,
  //           stagger: 0.04,
  //           ease: "power3.out",
  //           scrollTrigger: {
  //             trigger: keyholdersGridRef.current,
  //             start: "top 85%",
  //             toggleActions: "play none none none",
  //           },
  //         }
  //       );
  //     }

  //     // Explore Link
  //     if (exploreRef.current) {
  //       gsap.fromTo(
  //         exploreRef.current,
  //         { opacity: 0, y: 20 },
  //         {
  //           opacity: 1,
  //           y: 0,
  //           duration: 0.8,
  //           ease: "power2.out",
  //           scrollTrigger: {
  //             trigger: exploreRef.current,
  //             start: "top 92%",
  //             toggleActions: "play none none none",
  //           },
  //         }
  //       );
  //     }
  //   },
  //   { scope: sectionRef }
  // );

  // High performance mouse tracking gradient glow for main cards
  const onMouseMoveMain = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const glow = card.querySelector(".card-glow") as HTMLElement;
    if (glow) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(glow, {
        x: x - glow.offsetWidth / 2,
        y: y - glow.offsetHeight / 2,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const onMouseLeaveMain = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const glow = card.querySelector(".card-glow") as HTMLElement;
    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  // GSAP-driven rich hover effects for main element cards
  const onMouseEnterCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const tagline = card.querySelector(".card-tagline") as HTMLElement;
    const image = card.querySelector(".card-image") as HTMLElement;
    const symbol = card.querySelector(".card-symbol") as HTMLElement;
    const border = card.querySelector(".card-border") as HTMLElement;

    gsap.to(tagline, {
      height: "auto",
      opacity: 1,
      marginTop: 14,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(image, {
      scale: 1.07,
      opacity: 0.42,
      filter: "grayscale(0%)",
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(symbol, {
      scale: 1.15,
      opacity: 0.12,
      rotate: 15,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(border, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onMouseLeaveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const tagline = card.querySelector(".card-tagline") as HTMLElement;
    const image = card.querySelector(".card-image") as HTMLElement;
    const symbol = card.querySelector(".card-symbol") as HTMLElement;
    const border = card.querySelector(".card-border") as HTMLElement;

    gsap.to(tagline, {
      height: 0,
      opacity: 0,
      marginTop: 0,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(image, {
      scale: 1.0,
      opacity: 0.18,
      filter: "grayscale(100%)",
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(symbol, {
      scale: 1.0,
      opacity: 0.03,
      rotate: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(border, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // GSAP-driven hover effects for keyholders cards
  const onMouseEnterKeyholder = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const tagline = card.querySelector(".key-tagline") as HTMLElement;
    const image = card.querySelector(".key-image") as HTMLElement;
    const sweep = card.querySelector(".key-sweep") as HTMLElement;
    const keyIcon = card.querySelector(".key-icon") as HTMLElement;

    gsap.to(tagline, {
      height: "auto",
      opacity: 1,
      marginTop: 8,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(image, {
      scale: 1.08,
      opacity: 0.35,
      filter: "grayscale(0%)",
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(sweep, {
      scaleX: 1,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(keyIcon, {
      rotate: 45,
      scale: 1.15,
      opacity: 0.8,
      stroke: "#e60000",
      duration: 0.4,
      ease: "back.out(1.7)",
      overwrite: "auto",
    });
    gsap.to(card, {
      borderColor: "rgba(230, 0, 0, 0.4)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onMouseLeaveKeyholder = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const tagline = card.querySelector(".key-tagline") as HTMLElement;
    const image = card.querySelector(".key-image") as HTMLElement;
    const sweep = card.querySelector(".key-sweep") as HTMLElement;
    const keyIcon = card.querySelector(".key-icon") as HTMLElement;

    gsap.to(tagline, {
      height: 0,
      opacity: 0,
      marginTop: 0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(image, {
      scale: 1.0,
      opacity: 0.15,
      filter: "grayscale(100%)",
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(sweep, {
      scaleX: 0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(keyIcon, {
      rotate: 0,
      scale: 1.0,
      opacity: 0.12,
      stroke: "#ffffff",
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(card, {
      borderColor: "rgba(255, 255, 255, 0.05)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="speakers"
      aria-labelledby="speakers-heading"
      className="relative py-10 sm:py-16 overflow-hidden bg-black"
    >
      {/* Immersive background glow */}
      <div className="absolute inset-0 bg-linear-to-b from-[#050505] via-black to-[#050000] pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-red-950/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* ── Header ── */}
        <div ref={headerRef} className="text-center mb-16 sm:mb-20">
          <div className="flex items-center justify-center gap-4 mb-5 animate-on-scroll ">
            <div className="h-px w-10 bg-white/20" />
            <span className="text-white/40 text-[10px] font-bold tracking-[0.35em] uppercase">
              The Voices
            </span>
            <div className="h-px w-10 bg-white/20" />
          </div>
          <h2
            id="speakers-heading"
            className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.05] tracking-tight animate-on-scroll "
          >
            Four Elements. One{" "}
            <span className="text-tedred drop-shadow-[0_0_15px_rgba(230,0,0,0.2)]">
              Explosion.
            </span>
          </h2>
          <p className="text-white/45 text-sm sm:text-base max-w-[480px] mx-auto leading-relaxed animate-on-scroll ">
            Our main speakers embody the classical elements — forces of nature
            ready to ignite the darkness.
          </p>
        </div>

        {/* ── Main 4 Element Speakers Grid ── */}
        <div
          ref={mainGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14"
        >
          {mainSpeakers.map((speaker) => (
            <div
              key={speaker.id}
              className="group/card speaker-card relative h-[480px] lg:h-[420px] overflow-hidden rounded border border-white/5 bg-neutral-950/70 backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer animate-on-scroll "
              onMouseMove={onMouseMoveMain}
              onMouseEnter={onMouseEnterCard}
              onMouseLeave={(e) => {
                onMouseLeaveMain(e);
                onMouseLeaveCard(e);
              }}
            >
              {/* Outer Glowing Border */}
              <div
                className={`card-border absolute inset-0 rounded pointer-events-none  z-1 bg-linear-to-br ${speaker.accent} p-px`}
              />
              {/* Core card inner background */}
              <div className="absolute inset-px bg-[#070707]/95 rounded z-2" />

              {/* Dynamic Interactive Glow */}
              <div
                className="card-glow pointer-events-none absolute left-0 top-0  z-3 w-96 h-96 rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${GLOW_COLORS[speaker.id]} 0%, transparent 70%)`,
                }}
              />

              {/* Grid texture */}
              <div className="absolute inset-0 rounded overflow-hidden z-3">
                <GridTexture />
              </div>

              {/* Large element symbol behind text */}
              <div className="card-symbol absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-60%] font-black text-[120px] leading-none opacity-[0.03] select-none pointer-events-none z-3 transition-all">
                {speaker.symbol}
              </div>

              {/* Speaker Grayscale to Color Image */}
              <Image
                src={speaker.image}
                alt={speaker.name}
                width={400}
                height={400}
                className="card-image absolute inset-0 w-full h-full object-cover opacity-18 grayscale select-none pointer-events-none z-4 transition-all"
              />

              {/* Content overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-7 z-5">
                {/* Element Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block px-3 py-1 text-[9px] font-black tracking-[0.25em] uppercase rounded-full bg-white/03 border border-white/08 transition-colors duration-300 ${speaker.roleColor}`}
                  >
                    {speaker.role}
                  </span>
                </div>

                <h3 className="font-black text-white text-2xl lg:text-3xl leading-tight tracking-tight mb-1.5">
                  {speaker.name}
                </h3>
                <p className="text-white/40 text-[12px] font-medium tracking-wide">
                  {speaker.description}
                </p>

                {/* Tagline — GSAP-animated expansion on hover */}
                <div className="card-tagline overflow-hidden h-0 ">
                  <p className="text-white/70 text-[11px]  italic border-l border-white/20 pl-3 leading-relaxed">
                    "{speaker.tagline}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Keyholders Header ── */}
        {!hideKeyholders && (
          <div
            ref={keyholdersHeaderRef}
            className="text-center mb-12 sm:mb-16 mt-24"
          >
            <div className="flex items-center justify-center gap-4 mb-4 animate-on-scroll ">
              <div className="h-px w-8 bg-white/15" />
              <span className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">
                VIP Guests & Keyholders
              </span>
              <div className="h-px w-8 bg-white/15" />
            </div>
            <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed animate-on-scroll ">
              Not just attendees — door-openers holding access to specific
              domains of knowledge.
            </p>
          </div>
        )}

        {/* ── Keyholders Grid ── */}
        {!hideKeyholders && (
          <div
            ref={keyholdersGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-16"
          >
            {keyholders.map((k) => (
              <div
                key={k.id}
                className="group/keyholder key-border relative aspect-3/4 overflow-hidden rounded border border-white/5 bg-[#060606]/95 backdrop-blur-md cursor-pointer animate-on-scroll "
                onMouseEnter={onMouseEnterKeyholder}
                onMouseLeave={onMouseLeaveKeyholder}
              >
                {/* Red sweep line on hover */}
                <div className="key-sweep absolute top-0 left-0 right-0 h-[2px] bg-tedred z-5 scale-x-0 origin-left" />

                {/* Initials background watermark */}
                <div className="absolute inset-0 bg-white/1 flex items-center justify-center z-2">
                  <span className="font-black text-6xl text-white/3 select-none transition-colors duration-300">
                    {k.initials}
                  </span>
                </div>

                {/* Keyholder Image */}
                <Image
                  src={k.image}
                  alt={k.name}
                  width={400}
                  height={400}
                  className="key-image absolute inset-0 w-full h-full object-cover opacity-15 grayscale select-none pointer-events-none z-3"
                />

                {/* Neon Key icon */}
                <div className="absolute top-3.5 right-3.5 z-5 bg-black/40 border border-white/5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-xs">
                  <svg
                    className="key-icon opacity-15 stroke-white"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="7" r="4" />
                    <line x1="10.83" y1="10.83" x2="20" y2="20" />
                    <line x1="18" y1="18" x2="20" y2="20" />
                    <line x1="15" y1="15" x2="16" y2="16" />
                  </svg>
                </div>

                {/* Info overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-4 z-4">
                  <span className="text-tedred/60 text-[9px] font-black tracking-[0.2em] uppercase mb-1 line-clamp-1">
                    {k.role}
                  </span>
                  <h3 className="text-white text-[13px] font-black leading-snug tracking-tight">
                    {k.name}
                  </h3>

                  {/* Expand tagline on hover using GSAP */}
                  <div className="key-tagline overflow-hidden h-0 ">
                    <p className="text-white/40 text-[9.5px] leading-snug border-l border-tedred/30 pl-2">
                      {k.tagline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Explore link ── */}
        {!hideExploreLink && (
          <div
            ref={exploreRef}
            className="text-center mt-12 animate-on-scroll "
          >
            <Link
              href="/event-2026"
              className="group/btn inline-flex items-center gap-2.5 text-white/50 hover:text-white text-[11px] font-black tracking-[0.22em] uppercase transition-colors duration-300 border-b border-white/10 hover:border-white/55 pb-1.5"
            >
              Explore Event Details
              <svg
                className="transition-transform duration-300 group-hover/btn:translate-x-1.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
