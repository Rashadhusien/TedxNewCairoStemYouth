import logger from "@/lib/logger";

import { getResendClient } from "./resend";

type SendVerificationEmailParams = {
  to: string;
  code: string;
  name?: string;
  idempotencyKey: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendVerificationEmail({
  to,
  code,
  name,
  idempotencyKey,
}: SendVerificationEmailParams) {
  const from = process.env.EMAIL_FROM;
  const resend = getResendClient();

  if (!resend || !from) {
    if (process.env.NODE_ENV === "development") {
      logger.info(
        { to, code },
        "[dev] Verification email (set RESEND_API_KEY and EMAIL_FROM to send for real)",
      );
      return;
    }
    throw new Error(
      "Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  }

  const displayName = escapeHtml(name?.trim() || "there");
  const safeCode = escapeHtml(code);

  const { data, error } = await resend.emails.send(
    {
      from,
      to: [from],
      subject: "Contact form submission",
      html: `
      <p>Hi ${displayName},</p>
      <p>Your email verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${safeCode}</p>
      <p>This code expires in 15 minutes. If you did not create an account, you can ignore this email.</p>
    `,
      tags: [{ name: "category", value: "email_verification" }],
    },
    { idempotencyKey },
  );

  if (error) {
    logger.error({ err: error, to }, "Failed to send verification email");
    throw new Error(error.message);
  }

  logger.info({ emailId: data?.id, to }, "Verification email sent");
}
