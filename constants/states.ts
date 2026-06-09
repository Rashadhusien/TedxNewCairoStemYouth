import { ROUTES } from "./routes";

export const DEFAULT_EMPTY = {
  title: "No Data Found",
  message:
    "Looks like the database is taking a nap. Wake it up with some new entries.",
  button: {
    text: "Add Data",
    href: ROUTES.HOME,
  },
};

export const DEFAULT_ERROR = {
  title: "Something Went Wrong",
  message: "Even our code can have a bad day. Give it another shot.",
  button: {
    text: "Retry Request",
    href: ROUTES.HOME,
  },
};

export const EMYPTY_TICKET = {
  image: {
    src: "/images/states/empty-ticket.png",
    alt: "No tickets found",
  },
  title: "No tickets found",
  message:
    "You haven't purchased a ticket yet. Browse our tiers and secure your spot.",
  button: {
    text: "Browse Tickets",
    href: ROUTES.TICKETS,
  },
};
