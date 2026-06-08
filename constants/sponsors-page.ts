import { Check, Mail, TrendingUp, Users, Zap, type LucideIcon } from "lucide-react";

export const SPONSOR_CONTACT_EMAIL = "tedxnewcairostemyouth@gmail.com";

export const sponsorDocuments = [
  {
    label: "Download Proposal",
    href: "/files/Proposal-of-TEDxNewCairoSTEMYouth.pdf",
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
    label: "Curated On-Ground",
    detail: "Ages 15–25 STEM minds",
  },
  {
    value: "7M+",
    label: "Digital Reach",
    detail: "Combined follower network",
  },
  {
    value: "70%",
    label: "University Students",
    detail: "The future workforce",
  },
  {
    value: "100%",
    label: "Opt-In Leads",
    detail: "Law 151/2020 compliant",
  },
];

export const sponsorRoiPoints = [
  "70% university students, 30% high school & young professionals",
  "Verified data: names, emails, majors, and skills",
  "Gamified opt-in lead generation through the Luminous Quest",
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
    id: "visionary",
    name: "Visionary",
    accent: "#EB0028",
    borderClass: "border-primary/40",
    bgClass: "bg-primary/5",
    price: "220,000 EGP",
    badge: "1 Exclusive Slot",
    featured: true,
    benefits: [
      'Category exclusivity: "Event powered by [Brand]"',
      "Priority Quest status for massive lead generation",
      "Exclusive custom survey (up to 10 questions to all 1,000 attendees)",
      "Brand prominently on all ID lanyards",
      "5-minute speech slot on main stage",
      "2 lead-generation questions in registration",
      "Premium Interaction Hub (9 sqm custom installation)",
      "3 VIP passes & exclusive VIP lounge branding",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    accent: "#C0C0C0",
    borderClass: "border-zinc-400/35",
    bgClass: "bg-zinc-400/5",
    price: "120,000 EGP",
    badge: "Limited Slots",
    featured: false,
    benefits: [
      "Prime Interaction Hub placement",
      "Priority Quest status (high point values)",
      "1 lead-generation question in registration",
      "Prominent logo on main stage backdrop",
      "Strong animated sponsored reel",
      "2 VIP passes",
      "2 branded items in goodie bags",
      "Complete post-event digital report (opt-in data)",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    accent: "#FFD700",
    borderClass: "border-amber-400/35",
    bgClass: "bg-amber-400/5",
    price: "90,000 EGP",
    badge: "Premium",
    featured: false,
    benefits: [
      "Interaction Hub placement at venue",
      "Mention in closing ceremony & thank-you posts",
      "Social media integration & sponsored reel",
      "Logo on Wall of Fame and rotational displays",
      "1 VIP pass",
      "1 branded item in goodie bags",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    accent: "#E8E8E8",
    borderClass: "border-border",
    bgClass: "bg-card/50",
    price: "25,000 EGP",
    badge: "Standard",
    featured: false,
    benefits: [
      "Logo on main Wall of Fame",
      "Official mention during event transitions",
      "Social media post + logo on digital campaigns",
      "1 VIP pass",
    ],
  },
  {
    id: "bronze",
    name: "Bronze",
    accent: "#cd7f32",
    borderClass: "border-[#cd7f32]/30",
    bgClass: "bg-[#cd7f32]/5",
    price: "12,000 EGP",
    badge: "Starter",
    featured: false,
    benefits: [
      "Logo on social platforms and website sponsor section",
      "Mention in official thank-you post",
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
