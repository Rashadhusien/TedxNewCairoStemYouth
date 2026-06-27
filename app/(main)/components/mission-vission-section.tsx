"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MissionVisionSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.15]);

  return (
    <section className="relative overflow-hidden py-24 px-6 md:px-12">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-background to-muted/20" />

      {/* Decorative blur */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-500/10 blur-[120px] rounded-full" />

      <div className="relative max-w-7xl mx-auto">
        {/* Intro */}
        {/* <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className=" mb-20"
          >
            <p className="text-3xl md:text-5xl leading-tight font-light tracking-tight">
              <span className="font-bold">TEDxNewCairoSTEMYouth</span> is an
              independently organized TEDx event licensed by{" "}
              <span className="text-primary font-semibold">TED</span> — bringing
              the spirit of ideas worth spreading to the heart of New Cairo.
            </p>

            <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
              We believe every mind carries a spark, and our stage exists to
              ignite it.
            </p>
          </motion.div> */}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_500px_1fr] gap-10 items-center">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded border bg-card/50 backdrop-blur-sm p-4 sm:p-8"
          >
            <span className="text-primary uppercase tracking-[0.3em] text-sm">
              Our Purpose
            </span>

            <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mt-3 mb-6">
              Mission
            </h3>

            <p className="text-sm sm:text-lg leading-relaxed text-muted-foreground">
              To create a transformative platform where Egypt's brightest young
              minds can share ideas that matter. We curate experiences that
              challenge conventional thinking and ignite innovation in every
              attendee.
            </p>
          </motion.div>

          {/* Parallax Image */}
          <div
            ref={imageRef}
            className="relative h-[650px] overflow-hidden rounded"
          >
            <motion.div style={{ y, scale }} className="absolute inset-0">
              <Image
                src="/images/mission-vission.webp"
                alt="TEDx Mission and Vision"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5">
                <p className="text-white text-xl font-semibold">
                  Ideas Worth Spreading
                </p>
                <p className="text-white/80 mt-2">
                  Empowering the next generation of changemakers.
                </p>
              </div>
            </div>
          </div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded border bg-card/50 backdrop-blur-sm p-4 sm:p-8"
          >
            <span className="text-primary uppercase tracking-[0.3em] text-lg">
              Our Future
            </span>

            <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mt-3 mb-6">
              Vision
            </h3>

            <p className="text-sm sm:text-lg leading-relaxed text-muted-foreground">
              A generation that doesn't fear the dark because they know they
              carry the light. We envision a future where every young Egyptian
              discovers that their voice is powerful and their ideas can change
              the world.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;
