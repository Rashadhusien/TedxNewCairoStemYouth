import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";

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
    "TEDxNewCairoSTEMYouth 2026. Discover inspiring ideas, visionary speakers, and Egypt's brightest STEM youth under the theme Luminous Darkness.",

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

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tedxnewcairostemyouth.org",
    siteName: "TEDxNewCairoSTEMYouth",
    title: "TEDxNewCairoSTEMYouth — Luminous Darkness",
    description:
      "Join TEDxNewCairoSTEMYouth 2026 and discover the light hidden within the darkness.",
  },

  twitter: {
    card: "summary_large_image",
    title: "TEDxNewCairoSTEMYouth — Luminous Darkness",
    description:
      "Join TEDxNewCairoSTEMYouth 2026 and discover the light hidden within the darkness.",
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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
