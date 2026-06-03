"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Handshake, ArrowUpRight, Award, Zap, Shield, Flame } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Grid line texture background
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

const SPONSOR_TIERS = [
  { id: "t1", name: "Platinum Partner", icon: Shield, description: "Lead stage presence" },
  { id: "t2", name: "Gold Partner", icon: Award, description: "Brand integration" },
  { id: "t3", name: "Silver Partner", icon: Zap, description: "Community activation" },
  { id: "t4", name: "Innovation Partner", icon: Flame, description: "Tech showcases" },

];

export default function SponsorsCTA() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll entrance staggers
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".sponsors-animate", { opacity: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      // Left Invitation Card slide-in
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, x: -50, scale: 0.98 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Right Slots Grid staggers
      gsap.fromTo(
        ".sponsor-slot",
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".sponsor-slot-grid",
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: containerRef }
  );

  // Invitation card mousemove cursor tracking glow
  const onMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const onMouseLeaveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const glow = card.querySelector(".card-glow") as HTMLElement;
    const border = card.querySelector(".card-border") as HTMLElement;

    gsap.to(glow, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(border, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onMouseEnterCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const border = card.querySelector(".card-border") as HTMLElement;
    gsap.to(border, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // Sponsor slots hover effects
  const onMouseEnterSlot = (e: React.MouseEvent<HTMLDivElement>) => {
    const slot = e.currentTarget;
    const icon = slot.querySelector(".slot-icon") as HTMLElement;
    
    gsap.to(slot, {
      borderColor: "rgba(230, 0, 0, 0.4)", // Neon red border
      backgroundColor: "rgba(10, 0, 0, 0.5)",
      scale: 1.03,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(icon, {
      scale: 1.15,
      color: "#e60000",
      opacity: 1,
      duration: 0.35,
      ease: "back.out(1.7)",
      overwrite: "auto",
    });
  };

  const onMouseLeaveSlot = (e: React.MouseEvent<HTMLDivElement>) => {
    const slot = e.currentTarget;
    const icon = slot.querySelector(".slot-icon") as HTMLElement;

    gsap.to(slot, {
      borderColor: "rgba(255, 255, 255, 0.04)",
      backgroundColor: "rgba(6, 6, 6, 0.95)",
      scale: 1.0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(icon, {
      scale: 1.0,
      color: "#ffffff",
      opacity: 0.25,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={containerRef}
      id="sponsors"
      aria-labelledby="sponsors-heading"
      className="relative py-28 overflow-hidden bg-black border-b border-white/4"
    >
      <div className="absolute inset-0 bg-linear-to-b from-black via-[#040000] to-black pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      <GridTexture />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Invitation Card */}
          <div className="lg:col-span-6">
            <div
              ref={cardRef}
              className="group/card relative overflow-hidden rounded-3xl border border-white/5 bg-[#070707]/95 p-8 sm:p-10 backdrop-blur-md opacity-0 cursor-pointer shadow-[0_15px_40px_rgba(0,0,0,0.7)]"
              onMouseMove={onMouseMoveCard}
              onMouseLeave={onMouseLeaveCard}
              onMouseEnter={onMouseEnterCard}
            >
              {/* Outer Glowing Border */}
              <div className="card-border absolute inset-0 rounded-3xl pointer-events-none opacity-0 z-1 bg-linear-to-br from-primary to-red-600 p-px" />
              {/* Core card inner background */}
              <div className="absolute inset-px bg-[#070707]/98 rounded-3xl z-2" />

              {/* Dynamic Interactive Glow */}
              <div
                className="card-glow pointer-events-none absolute left-0 top-0 opacity-0 z-3 w-[450px] h-[450px] rounded-full blur-3xl"
                style={{
                  background: "radial-gradient(circle, rgba(230, 0, 0, 0.15) 0%, transparent 70%)",
                }}
              />

              {/* Grid texture */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden z-3">
                <GridTexture />
              </div>

              {/* Content overlay */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.35em] text-primary uppercase">
                    Partner With Us
                  </span>
                </div>

                <h2
                  id="sponsors-heading"
                  className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none mb-6"
                >
                  Join the <span className="text-glow-white text-white">Ignition.</span><br />
                  Fuel the Future.
                </h2>

                <p className="text-white/45 text-sm sm:text-base leading-relaxed mb-8 max-w-[480px]">
                  Connect your brand with over 500 future leaders, technical visionaries, and community builders. Partnering with TEDxNewCairoSTEMYouth gives your brand high-impact physical and digital activation, direct recruitment channels, and prime exposure.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/sponsors/proposal.pdf"
                    className="group/btn relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-black tracking-[0.2em] uppercase rounded-xl bg-primary text-white transition-all hover:bg-red-700 shadow-[0_5px_15px_rgba(230,0,0,0.25)] hover:shadow-[0_8px_20px_rgba(230,0,0,0.4)]"
                  >
                    Get Proposal
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-black tracking-[0.2em] uppercase rounded-xl border border-white/10 hover:border-white/35 text-white/50 hover:text-white bg-white/1 hover:bg-white/4 transition-all"
                  >
                    Contact PR Team
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Slots Grid */}
          <div className="lg:col-span-6 sponsor-slot-grid">
            <div className="grid grid-cols-2 gap-4">
              {SPONSOR_TIERS.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={tier.id}
                    className="sponsor-slot relative overflow-hidden rounded-2xl border border-white/4 bg-[#060606]/95 p-6 backdrop-blur-md cursor-pointer opacity-0"
                    onMouseEnter={onMouseEnterSlot}
                    onMouseLeave={onMouseLeaveSlot}
                  >
                    {/* Grid line texture overlay */}
                    <div className="absolute inset-0 z-1 overflow-hidden rounded-2xl">
                      <GridTexture />
                    </div>

                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[110px]">
                      {/* Top icon and placeholder tag */}
                      <div className="flex justify-between items-start mb-4">
                        <Icon className="slot-icon w-8 h-8 text-white opacity-25 transition-all" />
                        <span className="text-[7.5px] font-black tracking-widest text-white/20 uppercase">
                          [ TIER SLOT ]
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="text-white text-[13px] font-black tracking-tight leading-snug">
                          {tier.name}
                        </h3>
                        <p className="text-white/30 text-[9.5px] leading-snug mt-1 font-medium">
                          {tier.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
