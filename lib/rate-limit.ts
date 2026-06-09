import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Singleton Redis client — safe to call at module level in Edge/Node
function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN",
    );
  }

  return new Redis({ url, token });
}

export type RateLimitAction =
  | "register"
  | "verify-email"
  | "login"
  | "resend-verification"
  | "forgot-password"
  | "reset-password"
  | "contact";

type LimitConfig = {
  tokens: number; // max requests
  window: Parameters<typeof Ratelimit.slidingWindow>[1]; // e.g. "1 m", "1 h"
};

const ACTION_LIMITS: Record<RateLimitAction, LimitConfig> = {
  register: { tokens: 5, window: "1 h" },
  "verify-email": { tokens: 10, window: "1 h" },
  login: { tokens: 10, window: "15 m" },
  "resend-verification": { tokens: 3, window: "1 h" },
  "forgot-password": { tokens: 3, window: "1 h" },
  "reset-password": { tokens: 5, window: "1 h" },
  contact: { tokens: 3, window: "1 h" },
};

// Cache limiter instances so we don't recreate them on every call
const limiterCache = new Map<RateLimitAction, Ratelimit>();

function getLimiter(action: RateLimitAction): Ratelimit {
  if (limiterCache.has(action)) {
    return limiterCache.get(action)!;
  }

  const { tokens, window } = ACTION_LIMITS[action];
  const limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: `tedx:rl:${action}`,
  });

  limiterCache.set(action, limiter);
  return limiter;
}

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfterSeconds: number };

/**
 * Check rate limit for a given action + identifier (IP or user ID).
 *
 * Usage:
 *   const result = await checkRateLimit("register", ip);
 *   if (!result.success) return { error: "Too many requests" };
 */
export async function checkRateLimit(
  action: RateLimitAction,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(action);
  const key = `${action}:${identifier}`;

  const { success, reset } = await limiter.limit(key);

  if (success) {
    return { success: true };
  }

  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
  return { success: false, retryAfterSeconds };
}
