"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import { mainLinks, socialLinks } from "@/constants";
import { Heart, FileIcon } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@animateicons/react/lucide";
import { ROUTES } from "@/constants/routes";

// Grid texture background
function GridTexture() {
  return (
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px),
          repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px)
        `,
      }}
    />
  );
}

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);

  // // Simple entry animation using GSAP on mount
  // useGSAP(
  //   () => {
  //     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  //       gsap.set(".footer-animate", { opacity: 1, y: 0 });
  //       return;
  //     }

  //     gsap.fromTo(
  //       ".footer-animate",
  //       { opacity: 0, y: 20 },
  //       {
  //         opacity: 1,
  //         y: 0,
  //         duration: 0.8,
  //         stagger: 0.1,
  //         ease: "power2.out",
  //         scrollTrigger: {
  //           trigger: containerRef.current,
  //           start: "top 95%",
  //           toggleActions: "play none none none",
  //         },
  //       }
  //     );
  //   },
  //   { scope: containerRef }
  // );

  // Social icon hover animations using GSAP
  const onMouseEnterSocial = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    gsap.to(el, {
      scale: 1.12,
      borderColor: "rgba(230, 0, 0, 0.4)",
      backgroundColor: "rgba(230, 0, 0, 0.1)",
      color: "#e60000",
      boxShadow: "0 0 15px rgba(230, 0, 0, 0.3)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onMouseLeaveSocial = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    gsap.to(el, {
      scale: 1.0,
      borderColor: "rgba(255, 255, 255, 0.08)",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      color: "rgba(255, 255, 255, 0.4)",
      boxShadow: "none",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <footer
      ref={containerRef}
      aria-labelledby="footer-heading"
      className="relative bg-black border-t border-white/4 pt-20 pb-8 text-white/45 overflow-hidden"
    >
      <GridTexture />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[30%] bg-primary/3 rounded-full blur-[140px] pointer-events-none" />

      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="relative z-10  mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-16">
          {/* Brand Column */}
          <div className="footer-animate md:col-span-5 flex flex-col items-start ">
            <Link href="/" className="mb-5 block">
              <Image
                src="/logo.png"
                alt="TEDxNewCairoSTEMYouth Logo"
                width={140}
                height={140}
                className="w-auto h-auto brightness-95"
              />
            </Link>
            <p className="text-[11px] sm:text-xs leading-relaxed max-w-sm text-white/35">
              TEDxNewCairoSTEMYouth is an independently organized TEDx event
              licensed by TED. Our platform exists to showcase groundbreaking
              innovations, ignite potential, and champion ideas worth spreading.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="footer-animate md:col-span-3 flex flex-col w">
            <h3 className="text-white text-[10px] font-black tracking-[0.35em] uppercase mb-5">
              Navigation
            </h3>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
              {mainLinks.map((item) => (
                <li key={item.route}>
                  <Link
                    href={item.route}
                    className="text-[11px] sm:text-xs font-semibold text-white/40 hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Extra Nav links */}
              <li key={ROUTES.PRIVACYPOLICY}>
                <Link
                  href={ROUTES.PRIVACYPOLICY}
                  className="text-[11px] sm:text-xs font-semibold text-white/40 hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li key={ROUTES.TERMESANDCONDITION}>
                <Link
                  href={ROUTES.TERMESANDCONDITION}
                  className="text-[11px] sm:text-xs font-semibold text-white/40 hover:text-primary transition-colors duration-200"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="footer-animate md:col-span-4 flex flex-col items-start ">
            <h3 className="text-white text-[10px] font-black tracking-[0.35em] uppercase mb-5">
              Connect
            </h3>
            <p className="text-[11px] sm:text-xs leading-relaxed mb-5 text-white/35">
              Stay updated with our latest announcements, speaker releases, and
              ticket drops.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((soc) => {
                const Icon = soc.icon;
                return (
                  <Link
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={soc.label}
                    className="w-9 h-9 rounded-full border border-white/8 bg-white/2 flex items-center justify-center text-white/40 transition-colors"
                    onMouseEnter={onMouseEnterSocial}
                    onMouseLeave={onMouseLeaveSocial}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-animate border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] sm:text-[11px] font-medium text-white/25 ">
          {/* Left copyright and legal disclaimers */}
          <div className="text-center sm:text-left leading-relaxed max-w-xl">
            <p className="text-white/35 font-semibold mb-1">
              © {new Date().getFullYear()} TEDxNewCairoSTEMYouth. All rights
              reserved.
            </p>
            <p className="text-[9.5px]">
              This independently organized TEDx event is operated under license
              from TED. TED, the TED logo, and TEDx are registered trademarks of
              TED Conferences, LLC.
            </p>
          </div>

          {/* Right Credit Attribution */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-primary fill-primary animate-pulse" />
            <span>by the TEDx IT Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
