// components/about/TheaterParallax.tsx
"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";

export default function TheaterParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,

    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  return (
    <section
      ref={ref}
      className="relative h-[520px] md:h-[600px] overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 top-[-15%] bottom-[-15%] bg-[url('/images/th.png')] bg-cover bg-center grayscale "
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,transparent_20%,transparent_72%,#000_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.45)_0%,transparent_40%,transparent_60%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-10 bg-primary/40" />
          <span className="text-primary/70 text-[9px] font-bold tracking-[0.3em] uppercase">
            The Venue
          </span>
          <div className="h-px w-10 bg-primary/40" />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="font-black text-white leading-[0.92] tracking-tight mb-3"
          style={{
            fontSize: "clamp(48px, 9vw, 80px)",
            fontFamily: "'Bebas Neue', sans-serif",
          }}
        >
          Hilton Nile
          <br />
          <span className="text-primary">Maadi</span>
        </motion.h2>

        <p className=" text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
          Where the light will ignite · July 31, 2026
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/12 bg-black/60 backdrop-blur-sm"
        >
          <MapPin className="size-3 text-primary shrink-0" />
          <span className="text-[11px] font-semibold text-white/65 tracking-wide">
            Hilton Nile Maadi — Grand Ballroom & Conference Hall · Cairo, Egypt
          </span>
        </motion.div>
      </div>
    </section>
  );
}
