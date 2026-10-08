import { MetadataRoute } from "next";
import { PUBLIC_FEATURES } from "@/lib/public-features";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.tedxnewcairostemyouth.org";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },

    ...(PUBLIC_FEATURES.about
      ? [
          {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
          },
        ]
      : []),

    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/event-2026`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/sponsors`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    ...(PUBLIC_FEATURES.tickets
      ? [
          {
            url: `${baseUrl}/tickets`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.9,
          },
        ]
      : []),

    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
