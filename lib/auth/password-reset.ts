import crypto from "crypto";

export const RESET_TOKEN_TTL_MINUTES = 30;

/**
 * Generate a cryptographically secure raw token and its SHA-256 hash.
 * The raw token goes into the email link; only the hash is stored in the DB.
 */
export function generatePasswordResetToken(): {
  raw: string;
  hash: string;
} {
  const raw = crypto.randomBytes(32).toString("hex"); // 64-char hex string
  const hash = hashPasswordResetToken(raw);
  return { raw, hash };
}

/**
 * Hash an incoming raw token from a URL query param for DB lookup.
 */
export function hashPasswordResetToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
