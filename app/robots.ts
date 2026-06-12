import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.tedxnewcairostemyouth.org/sitemap.xml",
    host: "https://www.tedxnewcairostemyouth.org",
  };
}
