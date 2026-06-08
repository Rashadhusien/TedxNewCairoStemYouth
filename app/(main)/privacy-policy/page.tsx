import React from "react";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We may collect personal information including your name, email address, phone number, educational background, organization, social media accounts, registration information, ticket details, survey responses, and sponsor interaction data.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information may be used to manage registrations, communicate event updates, provide event services, improve attendee experiences, conduct analytics, facilitate networking opportunities, and comply with legal obligations.",
  },
  {
    title: "Sponsor Data Sharing",
    content:
      "When you explicitly consent during registration, surveys, sponsor activities, booth visits, QR-code scans, competitions, or networking programs, your information may be shared with participating sponsors. Sponsors may use this information to contact you regarding internships, job opportunities, educational programs, services, promotions, or future collaborations.",
  },
  {
    title: "Consent-Based Sharing",
    content:
      "We do not sell personal information. Any sharing of attendee information with sponsors occurs only when consent is provided through event forms, registration processes, booth interactions, surveys, or other opt-in mechanisms.",
  },
  {
    title: "Analytics & Cookies",
    content:
      "We may use cookies and analytics tools to understand website usage, improve performance, monitor engagement, and enhance the user experience.",
  },
  {
    title: "Data Retention",
    content:
      "Personal information is retained only for as long as necessary to fulfill event-related purposes, legal obligations, reporting requirements, or sponsor programs that you have consented to join.",
  },
  {
    title: "Data Security",
    content:
      "Reasonable technical and organizational safeguards are implemented to protect personal information against unauthorized access, disclosure, alteration, or destruction.",
  },
  {
    title: "Your Rights",
    content:
      "You may request access to your personal information, correction of inaccurate information, withdrawal of consent, or deletion of data where applicable under local laws.",
  },
  {
    title: "Third-Party Services",
    content:
      "The website may use third-party services such as payment processors, analytics providers, event management systems, email communication platforms, and sponsor systems that process information on our behalf.",
  },
  {
    title: "Children's Privacy",
    content:
      "If the event permits participation by minors, parental or guardian consent may be required where applicable by law.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy periodically. Changes become effective once published on this page.",
  },
  {
    title: "Contact Us",
    content:
      "For privacy-related inquiries or requests regarding your personal information, please contact the organizing team through the official contact channels provided on the website.",
  },
];

const PrivacyPolicy = () => {
  return (
    <main className="container mx-auto max-w-4xl px-6 py-24 ">
      <div className="mb-12">
        <h1 className="  text-4xl font-bold tracking-tight">Privacy Policy</h1>

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

export default PrivacyPolicy;
