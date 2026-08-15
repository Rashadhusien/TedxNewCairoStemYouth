import type { Metadata } from "next";
import FailedContent from "./_failed-content";

export const metadata: Metadata = {
  title: "Payment Failed",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TicketFailedPage() {
  return <FailedContent />;
}