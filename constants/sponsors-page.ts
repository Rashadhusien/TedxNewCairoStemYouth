import { TrendingUp, Users, Zap, type LucideIcon } from "lucide-react";

export const SPONSOR_CONTACT_EMAIL = "tedxnewcairostemyouth@gmail.com";

export const sponsorDocuments = [
  {
    label: "Download Proposal",
    href: "/files/TEDxNewCairoSTEMYouthProposal.pdf",
    variant: "primary" as const,
  },
  {
    label: "Download Portfolio",
    href: "/files/Portfolio-of-TEDxNewCairoSTEMYouth.pdf",
    variant: "outline" as const,
  },
];

export const sponsorRoiStats = [
  {
    value: "1,000+",
    label: "Elite STEM Audience",
    detail: "Curated on-ground attendees",
  },
  {
    value: "7M+",
    label: "Combined Social Reach",
    detail: "Across all platforms",
  },
  {
    value: "500K+",
    label: "Digital Impressions",
    detail: "Across platforms & campaigns",
  },
  {
    value: "90%+",
    label: "Brand Recall Rate",
    detail: "6-screen visual omnipresence",
  },
  {
    value: "40%+",
    label: "Lead Cost Savings",
    detail: "Vs. traditional acquisition",
  },
];

export const sponsorRoiPoints = [
  "Thought Leadership ROI: main stage presence before 1,000+ attendees and thousands of online viewers",
  "Visual Dominance: logo on 6 auxiliary screens + main LED stage ensuring 90%+ brand recall",
  "Direct Lead Generation: immediate access to 1,000 top-tier STEM graduates and students",
  "PR & Digital Reach: 500K+ impressions with ~500K EGP Advertising Value Equivalent",
];

export const luminousQuestFeatures: {
  icon: LucideIcon;
  title: string;
  text: string;
}[] = [
  {
    icon: Users,
    title: "Guaranteed Foot Traffic",
    text: "Attendees join a high-stakes treasure hunt. To earn maximum points toward the grand prize, they must visit your Interaction Hub.",
  },
  {
    icon: Zap,
    title: "Instant Lead Retrieval",
    text: "Every QR scan captures attendee data—name, email, major—delivering a verified list of high-intent leads tailored to your goals.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Visibility",
    text: "Your brand appears on the live Luminous Quest leaderboard, projecting energy and keeping the crowd engaged throughout the day.",
  },
];

export const confirmedSponsorsList = [
  {
    id: 1,
    name: "Alorica Egypt",
    initials: "AE",
    description:
      "Global customer experience leader with 100,000 employees across 17 countries — committed to Egypt's talent pipeline and digital future.",
    tier: "Confirmed Sponsor",
  },
];

export const sponsorPartners = [
  {
    id: 1,
    name: "EraaSoft",
    initials: "ES",
    description:
      "Empowering through technology—bridging the gap between learning and employment for 200+ professionals.",
    tier: "Confirmed Partner",
  },
  {
    id: 2,
    name: "NB Companies",
    initials: "NB",
    description:
      "Visionary partner aligning with Egypt's most ambitious young innovators and STEM leaders.",
    tier: "Confirmed Partner",
  },
];

export const sponsorshipTiers = [
  {
    id: "strategic",
    name: "Strategic Partner",
    accent: "#EB0028",
    borderClass: "border-primary/40",
    bgClass: "bg-primary/5",
    price: "350,000 EGP",
    badge: "3-4 Slots",
    featured: true,
    benefits: [
      "Keynote speech or panel slot on main stage",
      "Premium Mega Booth with interactive activities & lead generation",
      "Logo on all 6 auxiliary screens across venue entrances & corridors",
      "Logo on main LED stage screens (largest size)",
      "Logo on hotel reception digital screens & photo backdrop",
      "Logo on all banners, directional signage & printed materials",
      "Exclusive promotional video on official social platforms",
      "Dedicated posts campaign highlighting company vision",
      "Permanent tag in live coverage & after-movies",
      "Logo on organizing crew t-shirts",
      "Sector exclusivity guarantee",
      "3 VIP passes with full lounge access",
      "Promotional materials in audience goodie bags",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    accent: "#FFD700",
    borderClass: "border-amber-400/35",
    bgClass: "bg-amber-400/5",
    price: "100,000 EGP",
    badge: "5-6 Slots",
    featured: false,
    benefits: [
      "Standard Booth in main exhibition hall for direct communication",
      "Logo on 4 of 6 auxiliary screens (high-traffic areas)",
      "Logo on indoor display screens & official sponsor board",
      "Dedicated social media post with live coverage mention",
      "1 VIP ticket with lounge access",
      "Promotional materials in welcome goodie bags",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    accent: "#E8E8E8",
    borderClass: "border-border",
    bgClass: "bg-card/50",
    price: "40,000 EGP",
    badge: "6-8 Slots",
    featured: false,
    benefits: [
      "Designated exhibition area with roll-up and display table",
      "Logo on 2 auxiliary screens in booth & exhibition area",
      "Logo on collective sponsor board (printed & digital)",
      "Logo on official event webpage",
      "Collective social media post across all platforms",
      "2 standard event tickets (no VIP lounge access)",
    ],
  },
  {
    id: "custom",
    name: "Custom Package",
    accent: "#A78BFA",
    borderClass: "border-violet-400/30",
    bgClass: "bg-violet-400/5",
    price: "Tailor-made",
    badge: "In-Kind & Custom",
    featured: false,
    benefits: [
      "Fully customized sponsorship combining financial & in-kind support",
      "Logistics or marketing coverage aligned to your objectives",
      "Flexible budget and deliverable structure",
      "Direct consultation with our partnerships team",
    ],
  },
];

export const partnershipSteps = [
  {
    step: "01",
    title: "Discovery Call",
    text: "Align on brand goals, audience fit, and tier recommendations with our partnerships team.",
  },
  {
    step: "02",
    title: "Custom Package",
    text: "We tailor deliverables—Quest points, surveys, hub size, and VIP access—to your KPIs.",
  },
  {
    step: "03",
    title: "On-Ground Activation",
    text: "Your Interaction Hub goes live with QR lead capture, leaderboard presence, and stage visibility.",
  },
  {
    step: "04",
    title: "Post-Event Intelligence",
    text: "Receive compliant opt-in lead exports, engagement metrics, and brand exposure reporting.",
  },
];
