"use client";
import { motion } from "framer-motion";

const ThemeSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#050505] via-[#080808] to-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10 bg-white/30" />
            <span className="text-white/60 text-xs font-semibold tracking-[0.3em] uppercase">
              Theme 2026
            </span>
            <div className="h-px w-10 bg-white/30" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-white/30">Luminous</span>{" "}
            <span className="text-white text-glow-white">Darkness</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: "The Darkness",
              text: "We acknowledge the real challenges, uncertainties, and fears that young minds face. The darkness is not denied — it is honored.",
            },
            {
              title: "The Spark",
              text: "Inside every person, even in their most difficult moment, there is a hidden light. A unique strength, a quiet idea, or a persistent dream.",
            },
            {
              title: "The Revelation",
              text: "This event is the moment that spark becomes a flame. When ideas shared on stage illuminate the path for an entire generation.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group p-6 border border-white/10 bg-white/2 hover:border-white/30 rounded-sm transition-all duration-400 glass"
            >
              <div className="text-white/20 font-black text-xs tracking-[0.3em] uppercase mb-4 group-hover:text-tedred/60">
                0{i + 1}
              </div>
              <h3 className="text-white font-bold text-lg mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemeSection;
