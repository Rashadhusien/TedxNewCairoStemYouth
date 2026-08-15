import SectionTitle from "@/components/layout/section-title";
import { Lightbulb, Users, Sparkles, TrendingUp } from "lucide-react";

const BENEFITS = [
  {
    icon: Lightbulb,
    title: "Ideas Worth Spreading",
    description: "Experience carefully curated talks that challenge assumptions, provoke thought, and leave you with perspectives you didn't walk in with.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Born out of STEM Youth, this event is built by students, for students — and open to anyone who believes that young minds can change the world.",
  },
  {
    icon: Sparkles,
    title: "One Day. One Stage.",
    description: "An immersive day where speakers, performers, and thinkers share a single spotlight in an unforgettable experience.",
  },
  {
    icon: TrendingUp,
    title: "Future Innovation",
    description: "Connect with Egypt's brightest STEM youth and discover the innovations that will shape tomorrow's landscape.",
  },
];

export default function WhyAttendSection() {
  return (
    <section className="relative py-20 px-6 lg:px-10 bg-black">
      <div className="absolute inset-0 bg-linear-to-b from-[#050505] via-black to-[#050000] pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-red-950/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SectionTitle
          eyebrow="Why Attend"
          title="Be Part of Something Extraordinary"
          subTitle="Discover why TEDxNewCairoSTEMYouth 2026 is an experience you won't want to miss."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative border border-white/10 bg-white/[0.02] p-6 rounded-lg transition-all hover:border-primary/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex size-12 items-center justify-center border border-primary/25 bg-primary/10 text-primary rounded-lg">
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}