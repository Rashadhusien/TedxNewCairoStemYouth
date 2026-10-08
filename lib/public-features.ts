/**
 * Public marketing features that stay off on the live production site
 * until they are ready to launch. They remain visible in local/dev.
 */
export const isProductionSite = process.env.NODE_ENV === "production";

export const PUBLIC_FEATURES = {
  tickets: !isProductionSite,
  about: !isProductionSite,
  contactForm: !isProductionSite,
} as const;
