import SectionTitle from "@/components/layout/section-title";

export default function ThemeExplanationSection() {
  return (
    <section className="relative py-20 px-6 lg:px-10 bg-black">
      <div className="absolute inset-0 bg-linear-to-b from-[#050505] via-black to-[#050000] pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-red-950/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <SectionTitle
          eyebrow="The Theme"
          title="Luminous Darkness"
          subTitle="Understanding the meaning behind our 2026 theme"
        />

        <div className="mt-12 space-y-6">
          <p className="text-lg text-white/80 leading-relaxed">
            <span className="text-primary font-semibold">Luminous Darkness</span> represents the duality of light and shadow, challenge and growth, potential and realization.
          </p>
          
          <p className="text-white/60 leading-relaxed">
            In a world often focused only on the light, we explore the depth and meaning found in darkness — not as an absence of light, but as a canvas where illumination truly reveals its power.
          </p>

          <p className="text-white/60 leading-relaxed">
            This theme challenges us to find growth in adversity, wisdom in uncertainty, and innovation in the spaces others might overlook. <span className="text-white/40 italic">(Team confirmation required for official theme description)</span>
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-white/10 bg-white/[0.02] p-6 rounded-lg">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="text-white font-semibold mb-2">Illumination</h3>
            <p className="text-sm text-white/50">Ideas that shine through challenges</p>
          </div>
          <div className="border border-white/10 bg-white/[0.02] p-6 rounded-lg">
            <div className="text-3xl mb-2">🌑</div>
            <h3 className="text-white font-semibold mb-2">Depth</h3>
            <p className="text-sm text-white/50">Finding meaning in the unknown</p>
          </div>
          <div className="border border-white/10 bg-white/[0.02] p-6 rounded-lg">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="text-white font-semibold mb-2">Transformation</h3>
            <p className="text-sm text-white/50">Turning potential into impact</p>
          </div>
        </div>
      </div>
    </section>
  );
}