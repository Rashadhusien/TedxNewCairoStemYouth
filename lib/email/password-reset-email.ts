// lib/email/password-reset-email.ts

import { escapeHtml } from "./escape-html";
import { renderEmailShell } from "./design-system";
import { sendTransactionalEmail } from "./send";

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
  idempotencyKey: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresInMinutes,
  idempotencyKey,
}: SendPasswordResetEmailParams): Promise<void> {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(resetUrl);

  const bodyHtml = `
    <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
    <p style="margin:0 0 32px;color:#aaaaaa;font-size:15px;line-height:1.6;">
      We received a request to reset the password for your account. Click the button below
      to choose a new password. This link expires in
      <strong style="color:#ffffff;">${expiresInMinutes} minutes</strong>.
    </p>
  `;

  const html = renderEmailShell({
    eyebrow: "Account security",
    heading: "Reset your password",
    bodyHtml,
    cta: { label: "Reset Password", url: resetUrl },
    footNote: `If the button doesn't work, copy this link into your browser: ${safeUrl}`,
  });

  await sendTransactionalEmail({
    to,
    subject: "Reset your password — TEDxNewCairoSTEMYouth",
    html,
    idempotencyKey,
    tags: [{ name: "category", value: "password_reset" }],
  });
}
