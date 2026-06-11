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
  title: "TEDxNewCairoSTEMYouth — Luminous Darkness",
  description:
    "TEDxNewCairoSTEMYouth at Ain Shams University. Theme: Luminous Darkness. Even in the deepest darkness, there is always a hidden light inside every person.",
  keywords: [
    "TEDx",
    "TEDxNewCairoSTEM",
    "Luminous Darkness",
    "Ain Shams University",
    "Cairo",
    "STEM",
    "Youth",
  ],
  authors: [{ name: "TEDxNewCairoSTEMYouth" }],
  metadataBase: new URL("https://tedxnewcairostemyouth.org"),
  openGraph: {
    title: "TEDxNewCairoSTEMYouth — Luminous Darkness",
    description:
      "Discover the light hidden within the darkness. Join TEDxNewCairoSTEMYouth at Ain Shams University.",
    url: "https://tedxnewcairostemyouth.org",
    siteName: "TEDxNewCairoSTEMYouth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEDxNewCairoSTEMYouth — Luminous Darkness",
    description: "Discover the light hidden within the darkness.",
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
