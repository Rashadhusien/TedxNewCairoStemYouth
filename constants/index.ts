import { ROUTES } from "./routes";
import { Flame, Clock, Users, ArrowRight } from "lucide-react";

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
