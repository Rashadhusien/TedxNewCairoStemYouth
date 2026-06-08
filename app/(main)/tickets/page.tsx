"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const Tickets = () => {
  return     <div className="bg-black min-h-screen flex flex-col items-center justify-center overflow-hidden relative py-20">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      {/* Top & bottom lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10 bg-primary/40" />
            <span className="text-primary/60 text-xs font-semibold tracking-[0.3em] uppercase">
              Tickets
            </span>
            <div className="h-px w-10 bg-primary/40" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
            Not Yet.
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg md:text-xl text-white/40 font-light leading-relaxed mb-3"
          >
            The best things in life are worth the wait.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm text-white/25 mb-12"
          >
            Ticket sales for{" "}
            <span className="text-primary/60">TEDxNewCairoSTEMYouth 2026</span>{" "}
            will open soon.
            <br />
            Stay connected and be the first to know.
          </motion.p>
        </motion.div>

        {/* Decorative ticket placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="relative px-4 py-8 md:p-10 border border-primary/20 bg-primary/5 rounded-sm mb-12 overflow-hidden w-full"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {/* Ticket notches */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border border-primary/20 hidden sm:block" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-black border border-primary/20 hidden sm:block" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
            <div className="text-center md:text-left">
              <div className="text-white/20 text-xs tracking-widest mb-1">
                EVENT
              </div>
              <div className="text-white font-bold text-sm">
                TEDxNewCairoSTEMYouth
              </div>
            </div>
            <div className="hidden md:block h-10 w-px border-l border-dashed border-white/10" />
            <div className="text-center">
              <div className="text-white/20 text-xs tracking-widest mb-1">
                DATE
              </div>
              <div className="text-primary font-bold text-sm">July 31, 2026</div>
            </div>
            <div className="hidden md:block h-10 w-px border-l border-dashed border-white/10" />
            <div className="text-center md:text-right">
              <div className="text-white/20 text-xs tracking-widest mb-1">
                STATUS
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-primary/60 font-bold text-sm"
              >
                COMING SOON
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="px-8 py-3 border border-white/10 text-white/60 text-sm font-semibold tracking-wide hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 bg-primary text-white text-sm font-semibold tracking-wide hover:shadow-[0_0_20px_rgba(235,0,40,0.4)] transition-all duration-300"
          >
            Get Notified
          </Link>
        </motion.div>
      </div>
    </div>;
};

export default Tickets;
