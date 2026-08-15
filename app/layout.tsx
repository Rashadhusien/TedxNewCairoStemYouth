import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/lib/analytics/client";
import { SessionIdentifier } from "@/components/SessionIdentifier";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tedxnewcairostemyouth.org"),

  title: {
    default: "TEDxNewCairoSTEMYouth — Luminous Darkness",
    template: "%s | TEDxNewCairoSTEMYouth",
  },

  description:
    "TEDxNewCairoSTEMYouth 2026 — Luminous Darkness. September 5, 2026 at Galal El Sharkawy - down town cairo. Get your ticket from 350 EGP and discover inspiring ideas from Egypt's brightest STEM youth.",

  keywords: [
    "TEDx",
    "TEDxNewCairoSTEMYouth",
    "TEDx Egypt",
    "TEDx Cairo",
    "Luminous Darkness",
    "STEM",
    "Youth",
    "Innovation",
    "Technology",
    "Leadership",
  ],

  authors: [
    {
      name: "TEDxNewCairoSTEMYouth",
    },
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tedxnewcairostemyouth.org",
    siteName: "TEDxNewCairoSTEMYouth",
    title: "TEDxNewCairoSTEMYouth — Luminous Darkness",
    description:
      "September 5, 2026 · Galal El Sharkawy - down town cairo. Get your ticket from 350 EGP and discover the light hidden within the darkness.",
    images: [
      {
        url: "/images/hero-poster.jpeg",
        width: 1200,
        height: 630,
        alt: "TEDxNewCairoSTEMYouth — Luminous Darkness",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TEDxNewCairoSTEMYouth — Luminous Darkness",
    description:
      "September 5, 2026 · Galal El Sharkawy - down town cairo. Get your ticket from 350 EGP and discover the light hidden within the darkness.",
    images: ["/images/hero-poster.jpeg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.className,
        "font-sans",
        syne.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <Script
          src="https://upload-widget.cloudinary.com/latest/global/all.js"
          type="text/javascript"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZQHHHCSM3F"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ZQHHHCSM3F');
    `}
        </Script>

        {/* Event Structured Data */}
        <Script
          id="event-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: "TEDxNewCairoSTEMYouth 2026 — Luminous Darkness",
            description:
              "TEDxNewCairoSTEMYouth 2026 — Luminous Darkness. September 5, 2026 at Galal El Sharkawy - down town cairo. Get your ticket from 350 EGP and discover inspiring ideas from Egypt's brightest STEM youth.",
            startDate: "2026-09-05T10:00:00",
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: "Galal El Sharkawy - down town cairo",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Cairo",
                addressCountry: "Egypt",
              },
            },
            url: "https://www.tedxnewcairostemyouth.org",
            organizer: {
              "@type": "Organization",
              name: "TEDxNewCairoSTEMYouth",
              url: "https://www.tedxnewcairostemyouth.org",
            },
          })}
        </Script>

        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col">
        <Analytics />
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            forcedTheme="dark"
          >
            <SessionProvider>
              <SessionIdentifier />
              {children}
            </SessionProvider>
            <Toaster richColors />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
