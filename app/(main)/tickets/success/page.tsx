import type { Metadata } from "next";
import SuccessContent from "./_success-content";

export const metadata: Metadata = {
  title: "Payment Confirmation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TicketSuccessPage() {
  return <SuccessContent />;
}