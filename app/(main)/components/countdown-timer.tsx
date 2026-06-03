"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TARGET_DATE = new Date("2026-07-31T00:00:00");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  useEffect(() => {
    const calc = () => {
      const diff = TARGET_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);
  return timeLeft;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0");
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 200);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-2.5">
      {/* Card */}
      <div className="relative group">
        {/* Corner accents - smaller on mobile */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 sm:w-2 sm:h-2 border-t border-l border-primary z-10" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 border-b border-r border-primary z-10" />

        <div className="relative w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] lg:w-[112px] lg:h-[112px] flex items-center justify-center border border-primary/25 bg-black hover:border-primary/55 transition-all duration-300 overflow-hidden">
          {/* Scan line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/7" />
          <motion.span
            key={value}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight transition-colors duration-150 ${
              flash ? "text-primary/90" : "text-white"
            }`}
          >
            {str}
          </motion.span>
        </div>
      </div>
      <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.28em] uppercase text-white/30">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.15, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="text-primary text-2xl sm:text-3xl md:text-4xl font-black font-mono mb-4 sm:mb-6 leading-none"
    >
      :
    </motion.span>
  );
}

export default function CountdownTimer() {
  const { days, hours, minutes, seconds } = useCountdown();

  return (
    <section className="relative py-12 sm:py-16 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-black via-[#0a0000] to-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[500px] h-[200px] sm:h-[240px] md:h-[280px] rounded-full bg-primary/[0.07] blur-[60px] sm:blur-[90px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-5">
            <div className="h-px w-6 sm:w-8 md:w-10 bg-primary/35" />
            <span className="text-primary/60 text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase">
              The Event Begins In
            </span>
            <div className="h-px w-6 sm:w-8 md:w-10 bg-primary/35" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 leading-none tracking-tight">
            Time Is <span className="text-primary">Running</span>
          </h2>
          <p className="text-white/25 text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.25em] uppercase mb-8 sm:mb-10 md:mb-14">
            July 31, 2026 · Ain Shams University
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4"
        >
          <TimeUnit value={days} label="Days" />
          <Colon />
          <TimeUnit value={hours} label="Hours" />
          <Colon />
          <TimeUnit value={minutes} label="Minutes" />
          <Colon />
          <TimeUnit value={seconds} label="Seconds" />
        </motion.div>
      </div>
    </section>
  );
}
