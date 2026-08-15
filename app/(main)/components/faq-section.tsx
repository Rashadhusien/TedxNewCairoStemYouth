import SectionTitle from "@/components/layout/section-title";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "When and where is the event?",
    answer:
      "TEDxNewCairoSTEMYouth 2026 takes place on September 5, 2026 at 10:00 AM. The venue is Galal El Sharkawy - down town cairo, Egypt.",
  },
  {
    question: "How much are tickets?",
    answer:
      "Regular admission is 350 EGP per ticket. We also offer 3 Friends and 5 Friends packages so you can book as a group. Exact prices are shown on the package cards above.",
  },
  {
    question: "How do I buy a ticket?",
    answer:
      "Sign in or create an account, choose a package above, enter the attendee details, then complete secure payment with Kashier. Once your payment is confirmed, your tickets are saved to your profile.",
  },
  {
    question: "Can I buy tickets for friends or family?",
    answer:
      "Yes. Pick a 3 or 5 Friends package and cover the whole group in one payment. Enter each attendee's name, email, and phone at checkout. Each attendee needs a registered account on the platform.",
  },
  {
    question: "What are access codes and promo codes?",
    answer:
      "Some packages require an access code provided by the organizers, which you enter at checkout. Promo codes are optional - enter one at checkout if you have a code that applies to your package.",
  },
  {
    question: "What happens after I pay?",
    answer:
      "Your order is confirmed instantly and your tickets appear in your profile, where you can view them at any time.",
  },
  {
    question: "What time should I arrive?",
    answer:
      "We recommend arriving 30 minutes before the event start time. Doors open at 9:30 AM. Please arrive early to allow time for check-in and seating. (Team confirmation required for exact timing)",
  },
  {
    question: "Can I buy a ticket at the venue?",
    answer:
      "Tickets are primarily sold online through our website to ensure availability and smooth check-in. We recommend purchasing in advance. Limited tickets may be available at the venue subject to availability. (Team confirmation required)",
  },
  {
    question: "Who can attend?",
    answer:
      "TEDxNewCairoSTEMYouth is open to everyone who is interested in ideas worth spreading. There are no specific age restrictions, but attendees under 16 should be accompanied by an adult. (Team confirmation required for age policy)",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Tickets are non-refundable unless the event is cancelled by the organizers. In case of event cancellation, full refunds will be processed. For exceptional circumstances, please contact our team. (Team confirmation required)",
  },
];

export default function FaqSection() {
  return (
    <section className="relative py-20 px-6 lg:px-10">
      <SectionTitle
        eyebrow="Need Help?"
        title="Frequently Asked Questions"
        subTitle="Everything you need to know before you book your spot at Luminous Darkness 2026."
      />
      <div className="max-w-3xl mx-auto mt-12 space-y-4">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-white/10 bg-white/3 px-6 py-5 open:border-primary/30"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <span className="font-semibold text-white">{item.question}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
