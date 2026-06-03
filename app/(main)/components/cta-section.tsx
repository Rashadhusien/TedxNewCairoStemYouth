"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="relative py-16 bg-black overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[300px] rounded-full bg-primary/3 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary/30" />
            <span className="text-primary/50 text-[11px] font-bold tracking-[0.3em] uppercase">
              Join Us
            </span>
            <div className="h-px w-12 bg-primary/30" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-black text-white mb-6 leading-tight"
          style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
        >
          Be Part of <span className="relative inline-block">the Light</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-10"
        >
          Partner with TEDxNewCairoSTEMYouth and connect with Egypt's brightest
          STEM youth at the intersection of ideas and innovation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="group px-8 py-3 bg-primary text-white font-semibold text-sm tracking-[0.15em] uppercase hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(230,0,40,0.3)] transition-all duration-300"
          >
            Get in Touch
          </Link>
          <Link
            href="/sponsors"
            className="px-8 py-3 border border-white/20 text-white/70 font-semibold text-sm tracking-[0.15em] uppercase hover:border-primary/50 hover:text-primary transition-all duration-300"
          >
            Become a Partner
          </Link>
        </motion.div>

        {/* Subtle bottom accent */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          <div className="w-1 h-1 bg-primary/40 rounded-full" />
          <div className="w-1 h-1 bg-primary/30 rounded-full" />
          <div className="w-1 h-1 bg-primary/20 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
