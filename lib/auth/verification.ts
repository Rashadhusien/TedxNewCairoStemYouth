import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";

export const VERIFICATION_OTP_EXPIRY_MS = 15 * 60 * 1000;
const OTP_BCRYPT_ROUNDS = 10;

export function normalizeAuthEmail(email: string) {
  return email.toLowerCase().trim();
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createAndSendVerificationOtp(
  email: string,
  name?: string,
) {
  const normalizedEmail = normalizeAuthEmail(email);
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
  const expires = new Date(Date.now() + VERIFICATION_OTP_EXPIRY_MS);

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, normalizedEmail));

  await db.insert(verificationTokens).values({
    identifier: normalizedEmail,
    token: hashedOtp,
    expires,
  });

  await sendVerificationEmail({
    to: normalizedEmail,
    code: otp,
    name,
    idempotencyKey: `email-verification/${normalizedEmail}/${Date.now()}`,
  });
}

export async function verifyOtpForEmail(email: string, otp: string) {
  const normalizedEmail = normalizeAuthEmail(email);

  const [record] = await db
    .select({
      token: verificationTokens.token,
      expires: verificationTokens.expires,
    })
    .from(verificationTokens)
    .where(eq(verificationTokens.identifier, normalizedEmail))
    .limit(1);

  if (!record) {
    return false;
  }

  if (record.expires < new Date()) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, normalizedEmail));
    return false;
  }

  return bcrypt.compare(otp, record.token);
}

export async function clearVerificationOtp(email: string) {
  const normalizedEmail = normalizeAuthEmail(email);
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, normalizedEmail));
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = normalizeAuthEmail(email);

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
      fullName: users.fullName,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  return user ?? null;
}
