import SectionTitle from "@/components/layout/section-title";
import ContactForm from "@/components/main/forms/contact-form";
import { EMAIL, PHONE, socialLinks } from "@/constants";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the TEDxNewCairoSTEMYouth team for partnerships, sponsorships, media inquiries, and event information.",
};
const Contact = () => {
  return (
    <div className="bg-black min-h-screen">
      {/* PAGE HERO */}
      <section className="relative pt-28  overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black via-[#0a0000] to-black pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <SectionTitle
          eyebrow="Reach Out"
          title="Let's Connect"
          subTitle="Whether you want to sponsor, partner, or simply learn more — we are listening."
        />
      </section>

      {/* FORM + SOCIAL */}
      <section className="relative py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Form — 3 cols */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Sidebar — 2 cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Direct contact */}
            <div className="p-6 border border-white/5 bg-white/1 rounded-sm ">
              <h3 className="text-white font-bold text-sm tracking-wide mb-4">
                Direct Contact
              </h3>
              <Link
                href={`mailto:${EMAIL}`}
                className="group flex items-center gap-3 text-white/50 hover:text-primary transition-colors duration-300 text-sm mb-4"
              >
                <Mail
                  size={16}
                  className=" flex items-center justify-center text-sm group-hover:border-primary/40 group-hover:text-primary rounded-sm transition-all duration-300 text-white/30"
                />
                {EMAIL}
              </Link>
              <Link
                href={`tel:${PHONE}`}
                className="group flex items-center gap-3 text-white/50 hover:text-primary transition-colors duration-300 text-sm"
              >
                <Phone
                  size={16}
                  className="flex items-center justify-center text-sm group-hover:border-primary/40 group-hover:text-primary rounded-sm transition-all duration-300 text-white/30"
                />
                {PHONE}
              </Link>
            </div>

            {/* Social links */}
            <div className="p-6 border border-white/5 bg-white/1 rounded-sm">
              <h3 className="text-muted-foreground font-bold text-sm tracking-wide mb-5">
                Follow Our Journey
              </h3>
              <div className="space-y-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-white/40 hover:text-white transition-colors duration-300"
                  >
                    <div className="w-8 h-8 flex items-center justify-center border border-white/5 group-hover:border-primary/40 group-hover:text-primary rounded-sm transition-all duration-300 text-white/30">
                      <s.icon />
                    </div>
                    <span className="text-sm">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Response time */}
            {/* <div className="p-5 border border-primary/10 bg-primary/3 rounded-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                <div>
                  <div className="text-white/60 text-xs font-semibold mb-1">
                    Response Time
                  </div>
                  <p className="text-white/30 text-xs leading-relaxed">
                    We typically respond within 24 hours. For urgent sponsorship
                    inquiries, mention it in your message.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
