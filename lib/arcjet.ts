import arcjet, { shield, detectBot, tokenBucket, request } from "@arcjet/next";

const isDevelopment = process.env.ARCJET_ENV === "development";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Shield protects against common attacks (SQLi, XSS, SSRF)
    shield({ mode: isDevelopment ? "DRY_RUN" : "LIVE" }),
    // Bot detection - allow search engines, block other bots
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR"],
    }),
    // Rate limiting - 100 requests per 10 minutes per IP
    tokenBucket({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      refillRate: 10, // refill 10 tokens every 10 seconds
      interval: 10, // interval in seconds
      capacity: 100, // maximum capacity
    }),
  ],
});

// Helper for server actions to get Arcjet protection
export async function protectServerAction() {
  const req = await request();
  return aj.protect(req, { requested: 1 });
}

// Stricter rate limiting for auth-related server actions
export const ajAuth = aj.withRule(
  tokenBucket({
    mode: isDevelopment ? "DRY_RUN" : "LIVE",
    refillRate: 5, // 5 requests per minute
    interval: 60, // 60 seconds
    capacity: 10, // burst capacity
  }),
);

export async function protectAuthServerAction() {
  const req = await request();
  return ajAuth.protect(req, { requested: 1 });
}
