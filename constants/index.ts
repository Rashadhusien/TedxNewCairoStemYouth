import {
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedinIcon,
  LinkIcon,
} from "@animateicons/react/lucide";
import { ROUTES } from "./routes";
import { Flame, Clock, Users, ArrowRight } from "lucide-react";
import { IconBrandWhatsappFilled } from "@tabler/icons-react";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const PAYMENT_METHODS = {
  cash: {
    label: "Cash",
    instructions:
      "Pay in cash at the TEDxNewCairoSTEMYouth registration desk. Bring exact change and keep your receipt.",
  },
  instapay: {
    label: "InstaPay",
    account: "01000000000",
    instructions:
      "Send the exact amount via InstaPay to the number above. Upload a screenshot of the successful transfer.",
  },
  bank_transfer: {
    label: "Bank Transfer",
    iban: "EG00XXXX000000000000000000000",
    instructions:
      "Transfer the exact amount to the bank account above. Upload a screenshot of the transfer confirmation.",
  },
} as const;
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const getEnvVar = (key: string): string | undefined => {
  const value = process.env[key];
  return value || undefined;
};

export const CLOUDINARY_CLOUD_NAME = getEnvVar(
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
);
export const CLOUDINARY_UPLOAD_PRESET = getEnvVar(
  "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
);

export const mainLinks = [
  {
    route: ROUTES.HOME,
    label: "Home",
  },
  {
    route: ROUTES.EVENT,
    label: "Event 2026",
  },
  {
    route: ROUTES.SPONSERS,
    label: "Sponsers",
  },
  {
    route: ROUTES.TICKETS,
    label: "Tickets",
  },
  {
    route: ROUTES.ABOUT,
    label: "About Us",
  },
  {
    route: ROUTES.CONTACT,
    label: "Contact",
  },
];

export const adminLinks = [
  {
    route: ROUTES.ADMIN,
    label: "Admin Panel",
  },
];

// About Section
export const STATS = [
  { number: "12+", label: "Speakers on stage" },
  { number: "500+", label: "Attendees expected" },
  { number: "8hr", label: "Of ideas & experiences" },
] as const;

export const PILLARS = [
  {
    icon: Flame,
    title: "Ideas Worth Spreading",
    text: "Each talk is carefully curated to challenge assumptions, provoke thought, and leave the audience with a perspective they didn't walk in with.",
  },
  {
    icon: Clock,
    title: "One Day. One Stage.",
    text: "From 11 AM to 7 PM on July 31 at Ain Shams University — an immersive day where speakers, performers, and thinkers share a single spotlight.",
  },
  {
    icon: Users,
    title: "Community First",
    text: "Born out of STEM Youth, this event is built by students, for students — and open to anyone who believes that young minds can change the world.",
  },
] as const;

export const confirmedSponsors = [
  { id: 1, label: "EraaSoft", initials: "ES" },
  { id: 2, label: "NB Companies", initials: "NB" },
];

export const openTiers = [
  {
    id: "visionary",
    label: "Visionary",
    symbol: "✦",
    color:
      "border-yellow-500/20 hover:border-yellow-400/35 hover:bg-yellow-400/[0.03]",
    symbolColor: "text-yellow-400/40",
  },
  {
    id: "platinum",
    label: "Platinum",
    symbol: "◈",
    color:
      "border-slate-400/20 hover:border-slate-300/35 hover:bg-slate-300/[0.03]",
    symbolColor: "text-slate-300/40",
  },
  {
    id: "gold",
    label: "Gold",
    symbol: "◆",
    color:
      "border-amber-500/20 hover:border-amber-400/35 hover:bg-amber-400/[0.03]",
    symbolColor: "text-amber-400/40",
  },
  {
    id: "silver",
    label: "Silver",
    symbol: "◇",
    color:
      "border-zinc-400/20 hover:border-zinc-300/35 hover:bg-zinc-300/[0.03]",
    symbolColor: "text-zinc-300/40",
  },
];

export const stats = [
  { value: "1000+", label: "STEM Youth" },
  { value: "14", label: "Speakers" },
  { value: "8hrs", label: "Of Ideas" },
];

// major skills
export const majorSkills = [
  { id: 1, label: "Software & AI" },
  { id: 2, label: "Robotics & Electronics" },
  { id: 3, label: "Mechanical & Industrial Engineering" },
  { id: 4, label: "Civil Engineering & Architecture" },
  { id: 5, label: "Applied Sciences" },
  { id: 6, label: "Business & Finance" },
  { id: 7, label: "Entrepreneurship & Startups" },
  { id: 8, label: "Marketing & PR" },
  { id: 9, label: "Design & Media" },
];

export const faculties = [
  { id: 1, label: "Engineering" },
  { id: 2, label: "Science" },
  { id: 3, label: "Business" },
  { id: 4, label: "Law" },
  { id: 5, label: "Medicine" },
  { id: 6, label: "Pharmacy" },
  { id: 7, label: "Education" },
  { id: 8, label: "Arts" },
  { id: 9, label: "Other" },
];
export const EMAIL = "tedxnewcairostemyouth@gmail.com";
export const socialLinks = [
  {
    icon: FacebookIcon,
    label: "Facebook",
    href: "https://www.facebook.com/tedxnewcairostemyouth",
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    href: "https://www.instagram.com/tedxnewcairostemyouth",
  },
  // linkedin tiktok whatsapp linktree offical tedx website
  {
    icon: LinkedinIcon,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/tedxnewcairostemyouth",
  },
  {
    icon: GlobeIcon,
    label: "TikTok",
    href: "https://www.tiktok.com/@tedxnewcairostemyouth",
  },
  {
    icon: IconBrandWhatsappFilled,
    label: "WhatsApp",
    href: "https://wa.me/966555555555",
  },
  {
    icon: LinkIcon,
    label: "Linktree",
    href: "https://linktr.ee/tedxnewcairostemyouth",
  },
  {
    icon: GlobeIcon,
    label: "Official TEDx Website",
    href: "https://tedxnewcairostemyouth.com",
  },
];
