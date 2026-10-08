import { MetadataRoute } from "next";
import { PUBLIC_FEATURES } from "@/lib/public-features";

export default function robots(): MetadataRoute.Robots {
  const disallow: string[] = [];
  if (!PUBLIC_FEATURES.tickets) disallow.push("/tickets");
  if (!PUBLIC_FEATURES.about) disallow.push("/about");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        ...(disallow.length > 0 ? { disallow } : {}),
      },
    ],
    sitemap: "https://www.tedxnewcairostemyouth.org/sitemap.xml",
    host: "https://www.tedxnewcairostemyouth.org",
  };
}
