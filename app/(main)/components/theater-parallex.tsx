"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";
import Link from "next/link";

export default function TheaterParallax() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-25%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section
      ref={ref}
      className="relative h-[560px] md:h-[680px] overflow-hidden"
    >
      {/* Background */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-x-0 top-[-15%] bottom-[-15%]
        bg-[url('/images/th-ainshams.jpeg')]
        bg-cover bg-center grayscale-[30%]"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]" />

      {/* Top / Bottom fade */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,transparent_18%,transparent_75%,#000_100%)]" />

      {/* Side fade */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.7)_0%,transparent_30%,transparent_70%,rgba(0,0,0,0.7)_100%)]" />

      {/* Gold accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,120,0.08),transparent_60%)]" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mx-auto"
        >
          {/* Section label */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px w-14 bg-primary/40" />

            <span
              className="
              text-[10px]
              uppercase
              tracking-[0.4em]
              font-semibold
              text-primary/80
            "
            >
              The Venue
            </span>

            <div className="h-px w-14 bg-primary/40" />
          </div>

          {/* Heading glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-24 w-72 h-72 rounded-full bg-primary/10 blur-[120px]" />

          <h2
            className="
            relative
            font-black
            leading-[0.9]
            tracking-tight
            text-primary
            mb-5
          "
            style={{
              fontSize: "clamp(52px,8vw,88px)",
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            The Art Theater
            <br />
          </h2>
          <span className="text-white text-lg sm:text-5xl font-bold mb-4 inline-block">
            Galal El Sharkawy
          </span>

          <p
            className="
            uppercase
            tracking-[0.3em]
            text-xs
            text-white/70
            mb-8
            font-medium
          "
          >
            Where the light will ignite · Sep 5, 2026
          </p>

          {/* Location pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="
            inline-flex
            items-center
            gap-3
            rounded-full
            px-5
            py-3
            border
            border-primary/20
            bg-black/50
            backdrop-blur-md
            shadow-lg
            hover:border-primary
            transition-colors
          "
          >
            <MapPin className="size-4 text-primary" />

            <Link
              href="https://www.google.com/maps/search/?api=1&query=The+Art+Theater+Galal+El+Sharkawy+Cairo"
              target="_blank"
              className="
              text-xs
              font-medium
              tracking-wide
              text-white/75 
            "
            >
              22 Ramses Street, Downtown Cairo, Egypt
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
