import {
  Camera,
  LayersMinusIcon,
  LayoutDashboard,
  type LucideIcon,
  Percent,
  ReceiptText,
  Tag,
  Ticket,
  Users,
  Users2,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboard",
    items: [
      {
        title: "Overview",
        url: ROUTES.ADMIN.HOME,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Event Management",
    items: [
      {
        title: "Check-in",
        url: ROUTES.ADMIN.CHECK_IN,
        icon: Camera,
      },
      {
        title: "Ticket Tiers",
        url: ROUTES.ADMIN.TICKET_TIERS.HOME,
        icon: Ticket,
      },
      {
        title: "Tickets",
        url: ROUTES.ADMIN.TICKETS,
        icon: ReceiptText,
      },
      {
        title: "Coupons",
        url: ROUTES.ADMIN.COUPONS.HOME,
        icon: Percent,
      },
      {
        title: "Offers",
        url: ROUTES.ADMIN.OFFERS.HOME,
        icon: Tag,
      },
    ],
  },
  {
    id: 3,
    label: "User Management",
    items: [
      {
        title: "Users",
        url: ROUTES.ADMIN.USERS,
        icon: Users,
      },
    ],
  },

  {
    id: 4,
    label: "Sponsors & Boothes",
    items: [
      {
        title: "Sponsors",
        url: ROUTES.ADMIN.SPONSORS.HOME,
        icon: LayersMinusIcon,
      },
    ],
  },
  {
    id: 5,
    label: "Speakers & Keyholders",
    items: [
      {
        title: "Speakers",
        url: ROUTES.ADMIN.SPEAKERS.HOME,
        icon: Users2,
      },
    ],
  },
];
