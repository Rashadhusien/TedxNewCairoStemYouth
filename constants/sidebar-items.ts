import {
  BadgePercent,
  Camera,
  CreditCard,
  Handshake,
  History,
  LayoutDashboard,
  Megaphone,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Tag,
  Ticket,
  type LucideIcon,
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
      // {
      //   title: "Ticket Tiers",
      //   url: ROUTES.ADMIN.TICKET_TIERS.HOME,
      //   icon: Ticket,
      // },
      // {
      //   title: "Tickets",
      //   url: ROUTES.ADMIN.TICKETS,
      //   icon: ReceiptText,
      // },
      // {
      //   title: "Coupons",
      //   url: ROUTES.ADMIN.COUPONS.HOME,
      //   icon: BadgePercent,
      // },
      // {
      //   title: "Offers",
      //   url: ROUTES.ADMIN.OFFERS.HOME,
      //   icon: Megaphone,
      // },
      {
        title: "Promo Codes",
        url: ROUTES.ADMIN.PROMO_CODES.HOME,
        icon: Tag,
      },
      {
        title: "Promo Code Tags",
        url: ROUTES.ADMIN.PROMO_CODES.TAGS,
        icon: Tag,
      },
      {
        title: "Packages",
        url: ROUTES.ADMIN.PACKAGES.HOME,
        icon: Package,
      },
      {
        title: "Orders",
        url: ROUTES.ADMIN.ORDERS.HOME,
        icon: ShoppingCart,
      },
      {
        title: "Manual Sales",
        url: ROUTES.ADMIN.MANUAL_SALES,
        icon: CreditCard,
      },
      {
        title: "Ticket Limit",
        url: ROUTES.ADMIN.SETTINGS.TICKET_LIMIT,
        icon: Settings,
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
    label: "Sponsors & Booths",
    items: [
      {
        title: "Sponsors",
        url: ROUTES.ADMIN.SPONSORS.HOME,
        icon: Handshake,
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
  {
    id: 6,
    label: "System & Settings",
    items: [
      {
        title: "Activity Logs",
        url: ROUTES.ADMIN.ACTIVITY_LOGS,
        icon: History,
      },
    ],
  },
];
