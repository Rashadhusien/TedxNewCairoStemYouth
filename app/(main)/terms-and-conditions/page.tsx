import React from "react";
export const metadata = {
  title: "Terms & Conditions",
  description:
    "Review the terms and conditions governing participation in TEDxNewCairoSTEMYouth events and services.",
};
const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing this website, registering for the event, purchasing a ticket, or participating in TEDxNewCairoSTEMYouth, you agree to be bound by these Terms and Conditions.",
  },
  {
    title: "2. Event Registration",
    content:
      "All registrations are subject to availability and approval. We reserve the right to refuse, cancel, or revoke registrations at our discretion if false information is provided or if participant behavior violates event policies.",
  },
  {
    title: "3. Ticket Policy",
    content:
      "Tickets are non-transferable unless otherwise stated. Refund policies, if available, will be communicated during registration. The organizer reserves the right to modify ticketing conditions when necessary.",
  },
  {
    title: "4. Event Changes",
    content:
      "The organizers reserve the right to modify the event schedule, speakers, venue, format, or other event details without prior notice if circumstances require.",
  },
  {
    title: "5. Code of Conduct",
    content:
      "All attendees must behave respectfully toward speakers, organizers, volunteers, sponsors, and fellow attendees. Harassment, discrimination, hate speech, disruptive behavior, or any inappropriate conduct may result in removal from the event without refund.",
  },
  {
    title: "6. Photography & Recording",
    content:
      "By attending the event, you acknowledge that photographs, videos, and audio recordings may be captured during the event. These materials may be used for promotional, educational, marketing, archival, and social media purposes.",
  },
  {
    title: "7. Intellectual Property",
    content:
      "All content displayed on this website, including logos, branding, graphics, text, and event materials, remains the property of TEDxNewCairoSTEMYouth or its respective owners and may not be copied or redistributed without permission.",
  },
  {
    title: "8. Sponsor Interactions",
    content:
      "Attendees may voluntarily interact with sponsors through booths, activities, surveys, QR-code scans, networking opportunities, and other engagement activities available during the event.",
  },
  {
    title: "9. Data Sharing With Sponsors",
    content:
      "Where attendees explicitly provide consent, personal information such as name, email address, phone number, educational background, interests, survey responses, or booth interaction data may be shared with participating sponsors for recruitment, networking, educational opportunities, marketing communications, and related purposes.",
  },
  {
    title: "10. Limitation of Liability",
    content:
      "The organizers shall not be responsible for any indirect, incidental, special, or consequential damages arising from participation in the event or use of this website.",
  },
  {
    title: "11. Termination",
    content:
      "We reserve the right to suspend or terminate access to event services, registrations, or participation if these terms are violated.",
  },
  {
    title: "12. Contact Information",
    content:
      "If you have any questions regarding these Terms and Conditions, please contact the organizing team through the contact information provided on the website.",
  },
];

const TermsAndConditions = () => {
  return (
    <main className="container mx-auto max-w-4xl px-6 py-24">
      <div className="mb-12">
        <h1 className="  text-4xl font-bold tracking-tight">
          Terms & Conditions
        </h1>

        <p className="mt-4 text-muted-foreground">Last Updated: January 2026</p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>

            <p className="leading-7 text-muted-foreground">{section.content}</p>
          </section>
        ))}
      </div>
    </main>
  );
};

export default TermsAndConditions;
