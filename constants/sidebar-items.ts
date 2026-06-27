import {
  LayersMinusIcon,
  LayoutDashboard,
  type LucideIcon,
  Percent,
  ReceiptText,
  Tag,
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
        title: "Tickets",
        url: ROUTES.ADMIN.TICKETS,
        icon: ReceiptText,
      },
      {
        title: "Coupons",
        url: ROUTES.ADMIN.COUPONS,
        icon: Percent,
      },
      {
        title: "Offers",
        url: ROUTES.ADMIN.OFFERS,
        icon: Tag,
      },
    ],
  },

  {
    id: 3,
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
    id: 4,
    label: "Speakers & Keyholders",
    items: [
      {
        title: "Speakers",
        url: ROUTES.ADMIN.SPEAKERS.HOME,
        icon: LayersMinusIcon,
      },
    ],
  },
];
