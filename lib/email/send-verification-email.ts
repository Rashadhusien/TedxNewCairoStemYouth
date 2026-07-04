// lib/email/verification-email.ts

import { escapeHtml } from "./escape-html";
import { renderEmailShell } from "./design-system";
import { sendTransactionalEmail } from "./send";

interface SendVerificationEmailParams {
  to: string;
  code: string;
  name?: string;
  idempotencyKey: string;
}

export async function sendVerificationEmail({
  to,
  code,
  name,
  idempotencyKey,
}: SendVerificationEmailParams): Promise<void> {
  const displayName = escapeHtml(name?.trim() || "there");
  const safeCode = escapeHtml(code);

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#aaaaaa;font-size:15px;line-height:1.6;">Hi ${displayName},</p>
    <p style="margin:0 0 16px;color:#aaaaaa;font-size:15px;line-height:1.6;">
      Your email verification code is:
    </p>
    <p style="margin:0 0 32px;font-family:'Space Mono','SFMono-Regular',Consolas,monospace;
              font-size:32px;font-weight:700;letter-spacing:6px;color:#C9A84C;">
      ${safeCode}
    </p>
    <p style="margin:0;color:#aaaaaa;font-size:14px;line-height:1.6;">
      This code expires in 15 minutes. If you did not create an account, you can ignore this email.
    </p>
  `;

  const html = renderEmailShell({
    eyebrow: "Verify your account",
    heading: "Confirm your email",
    bodyHtml,
  });

  await sendTransactionalEmail({
    to,
    subject: "Verify your TEDxNewCairoSTEMYouth account",
    html,
    idempotencyKey,
    tags: [{ name: "category", value: "email_verification" }],
  });
}
