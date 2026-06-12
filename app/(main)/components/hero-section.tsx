"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/** Maps hero scroll progress → playback rate with soft plateaus at start/end. */
// function scrollProgressToPlaybackRate(progress: number) {
//   const edge = 0.18;
//   if (progress <= edge || progress >= 1 - edge) return 1;
//   const inner = (progress - edge) / (1 - 2 * edge);
//   const shaped = gsap.parseEase("power2.inOut")(inner);
//   return 1 + shaped * 0.55;
// }

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // useGSAP(
  //   () => {
  //     const video = videoRef.current;
  //     const container = containerRef.current;
  //     if (!video || !container) return;

  //     const scrollTriggers: ScrollTrigger[] = [];

  //     // ── Mount: fade in + gentle speed ramp (never 0× — browsers stutter) ──
  //     gsap.set(video, { opacity: 0, playbackRate: 0.65, scale: 1.04 });
  //     void video.play().catch(() => {});

  //     const mountTl = gsap.timeline({ delay: 0.1 });
  //     mountTl.to(video, {
  //       opacity: 0.55,
  //       playbackRate: 1,
  //       scale: 1,
  //       duration: 3.4,

  //       ease: "power1.inOut",
  //     });

  //     // ── Entrance stagger ───────────────────────────────────────────────────
  //     const entranceTl = gsap.timeline({ delay: 0.35 });

  //     entranceTl
  //       .fromTo(
  //         overlayRef.current,
  //         { opacity: 0 },
  //         { opacity: 1, duration: 1.6, ease: "power2.out" },
  //       )
  //       .fromTo(
  //         badgeRef.current,
  //         { opacity: 0, y: -12, filter: "blur(4px)" },
  //         {
  //           opacity: 1,
  //           y: 0,
  //           filter: "blur(0px)",
  //           duration: 0.85,
  //           ease: "power3.out",
  //         },
  //         "-=1.1",
  //       )
  //       .fromTo(
  //         headingRef.current,
  //         { opacity: 0, y: 32, filter: "blur(6px)" },
  //         {
  //           opacity: 1,
  //           y: 0,
  //           filter: "blur(0px)",
  //           duration: 1,
  //           ease: "power3.out",
  //         },
  //         "-=0.55",
  //       )
  //       .fromTo(
  //         paragraphRef.current,
  //         { opacity: 0, y: 18 },
  //         { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
  //         "-=0.6",
  //       )
  //       .fromTo(
  //         buttonsRef.current,
  //         { opacity: 0, y: 16 },
  //         { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
  //         "-=0.5",
  //       );

  //     // ── Scroll → video speed (single quickTo, no stacked tweens) ───────────
  //     // const setPlaybackRate = gsap.quickTo(video, "playbackRate", {
  //     //   duration: 1.1,
  //     //   ease: "power2.out",
  //     // });

  //     // const speedSt = ScrollTrigger.create({
  //     //   trigger: container,
  //     //   start: "top top",
  //     //   end: "bottom top",
  //     //   scrub: 2.6,
  //     //   onUpdate: (self) => {
  //     //     setPlaybackRate(scrollProgressToPlaybackRate(self.progress));
  //     //   },
  //     // });
  //     // scrollTriggers.push(speedSt);

  //     // Subtle zoom-out while scrolling — masks speed changes, feels cinematic
  //     // const videoZoom = gsap.to(video, {
  //     //   scale: 1.06,
  //     //   ease: "none",
  //     //   scrollTrigger: {
  //     //     trigger: container,
  //     //     start: "top top",
  //     //     end: "bottom top",
  //     //     scrub: true,
  //     //   },
  //     // });
  //     // scrollTriggers.push(videoZoom.scrollTrigger!);

  //     // ── Parallax (lighter + scrub lag) ───────────────────────────────────
  //     const headingTween = gsap.to(headingRef.current, {
  //       y: -36,
  //       ease: "none",
  //       scrollTrigger: {
  //         trigger: container,
  //         start: "top top",
  //         end: "bottom top",
  //         scrub: 1.6,
  //       },
  //     });
  //     scrollTriggers.push(headingTween.scrollTrigger!);

  //     const paragraphTween = gsap.to(paragraphRef.current, {
  //       y: -18,
  //       ease: "none",
  //       scrollTrigger: {
  //         trigger: container,
  //         start: "top top",
  //         end: "bottom top",
  //         scrub: 1.6,
  //       },
  //     });
  //     scrollTriggers.push(paragraphTween.scrollTrigger!);

  //     return () => {
  //       mountTl.kill();
  //       entranceTl.kill();
  //       scrollTriggers.forEach((st) => st.kill());
  //       gsap.killTweensOf(video);
  //     };
  //   },
  //   { scope: containerRef },
  // );

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="w-full absolute -z-1 inset-0 min-h-screen aspect-auto object-cover origin-center will-change-[opacity,transform]"
      >
        <source src="/hero-theater.mp4" type="video/mp4" />
      </video>

      <div
        ref={overlayRef}
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(220,38,38,0.18) 0%, transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="container mx-auto flex justify-center h-full">
        <div className="flex flex-col gap-4 mt-[140px] sm:mt-[160px] items-center">
          <div ref={badgeRef} className="">
            <div className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-white/55 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
              Visit Our —{" "}
              <Link
                href="https://www.ted.com/tedx/events/68964"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline inline-flex items-center gap-1 transition-opacity hover:opacity-80"
              >
                Official Page on TED <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>

          <h1
            ref={headingRef}
            className=" text-2xl sm:text-6xl  font-extrabold text-center leading-tight"
          >
            Without darkness <br />
            <span className="text-glow-white">Light </span> has no meaning.
          </h1>

          <p
            ref={paragraphRef}
            className=" text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-6 text-center text-white/70"
          >
            When others saw despair, we saw potential.{" "}
            <span className=" font-bold">TEDxNewCairoSTEMYouth</span>{" "}
            <br className="hidden sm:block" />
            exists to turn darkness into light and ideas into impact.
          </p>

          <div
            ref={buttonsRef}
            className=" grid grid-cols-2 gap-4 w-full max-w-md max-sm:px-4"
          >
            <Button className="py-6  sm:text-base cursor-pointer transition-transform active:scale-95">
              Explore the Experience
            </Button>
            <Button
              className="py-6  sm:text-base transition-transform active:scale-95"
              variant="outline"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
