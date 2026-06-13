"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { confirmedSponsors, openTiers, stats } from "@/constants";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sponsor } from "@/lib/db/schema";
import { getInitials } from "@/lib/utils";
function TierLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-white/6" />
      <span className="text-[9px] font-bold tracking-[0.28em] uppercase text-white/20 whitespace-nowrap">
        {text}
      </span>
      <div className="flex-1 h-px bg-white/6" />
    </div>
  );
}

export default function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  console.log(sponsors);
  return (
    <section className="relative  bg-black overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-t from-black via-[#060000] to-black pointer-events-none" />
      {/* Subtle red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/4 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-10 bg-primary/35" />
            <span className="text-primary/60 text-[8px] font-bold tracking-[0.3em] uppercase">
              Partners & Sponsors
            </span>
            <div className="h-px w-10 bg-primary/35" />
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-[56px] font-black text-white mb-4 leading-none tracking-tight">
            Who Measure the <span className="text-primary">Light</span>
          </h2>
          <p className="text-white/38 text-sm max-w-xl mx-auto leading-relaxed">
            Join visionary organizations empowering 1,000+ top STEM youth.
          </p>
        </motion.div>

        <TierLabel text="Confirmed Partners" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {sponsors &&
            sponsors.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-4 flex items-center max-w-xs justify-center border border-primary/20 bg-primary/4 hover:border-primary/55 hover:bg-primary/8 hover:shadow-[0_0_24px_rgba(230,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="text-center">
                  <div className="size-27.5 rounded-full overflow-hidden border border-primary/20 bg-primary/8 group-hover:bg-primary/15 group-hover:border-primary/55 flex items-center justify-center mx-auto mb-2.5 transition-all duration-300">
                    {s.logoUrl ? (
                      <Image
                        src={s.logoUrl}
                        alt={s.name}
                        width={144}
                        height={144}
                        className="object-cover rounded-full  "
                      />
                    ) : (
                      <span className="text-4xl font-bold text-primary/60 group-hover:text-primary transition-colors duration-300">
                        {getInitials(s.name)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm sm:text-md font-bold tracking-[0.12em] uppercase text-white/55 group-hover:text-white transition-colors duration-300">
                    {s.name}
                  </span>
                </div>
              </motion.div>
            ))}
        </div>

        {/* ── Open tiers ── */}
        {/* <TierLabel text="Open Sponsorship Tiers" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-12">
          {openTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`group h-[88px] flex flex-col items-center justify-center gap-2 border border-dashed hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${tier.color}`}
            >
              <span
                className={`text-[18px] leading-none transition-opacity duration-300 group-hover:opacity-80 ${tier.symbolColor}`}
              >
                {tier.symbol}
              </span>
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/18 group-hover:text-white/45 transition-colors duration-300">
                {tier.label}
              </span>
            </motion.div>
          ))}
        </div> */}

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-white/6 border border-white/6 mb-12"
        >
          {stats.map((s) => (
            <div key={s.label} className="py-5 text-center">
              <div
                className="font-black text-[34px] md:text-[40px] text-primary leading-none mb-1 tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {s.value}
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/28">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <Button
          size={"lg"}
          className="text-center mx-auto flex-center py-6 px-8 text-lg w-full"
          asChild
          variant={"outline"}
        >
          <Link href="/sponsors">
            Join the Luminous Quest
            <ArrowRight className="size-3.5 " />
          </Link>
        </Button>
      </div>
    </section>
  );
}
