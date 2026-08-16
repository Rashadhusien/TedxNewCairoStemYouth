import SectionTitle from "@/components/layout/section-title";
import { UserPlus, Package, CreditCard, BadgeCheck } from "lucide-react";

interface Step {
  icon: typeof UserPlus;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: "Create an account",
    description:
      "Sign in or sign up for a free account on the platform. Each attendee needs a registered account.",
  },
  {
    icon: Package,
    title: "Choose your package",
    description:
      "Pick a Regular ticket or a 3 / 5 Friends package above. Package details and availability are shown on each card.",
  },
  {
    icon: CreditCard,
    title: "Complete your details & pay",
    description:
      "Enter the name, email, and phone of every attendee, apply any promo code, then pay securely with Kashier.",
  },
  {
    icon: BadgeCheck,
    title: "Get your tickets",
    description:
      "As soon as payment is confirmed, your tickets are saved to your profile and ready for the big day.",
  },
];

export default function HowToAttendSection() {
  return (
    <section className="relative py-20 px-6 lg:px-10">
      <SectionTitle
        eyebrow="Simple & Secure"
        title="How to Attend"
        subTitle="Booking your spot at Luminous Darkness 2026 takes just four steps."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="relative rounded-xl border border-white/10 bg-white/3 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/25">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-5xl font-extrabold text-white/10">
                {index + 1}
              </span>
            </div>
            <h3 className="font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
