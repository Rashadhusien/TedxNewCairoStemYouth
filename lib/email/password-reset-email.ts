// lib/email/password-reset-email.ts
// Uses Resend — same pattern as your existing email utilities

import logger from "../logger";
import { getResendClient } from "./resend";

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresInMinutes,
}: SendPasswordResetEmailParams): Promise<void> {
  const from = process.env.EMAIL_FROM;
  const resend = getResendClient();

  if (!resend || !from) {
    if (process.env.NODE_ENV === "development") {
      logger.info(
        { to },
        "[dev] Verification email (set RESEND_API_KEY and EMAIL_FROM to send for real)",
      );
      return;
    }
    throw new Error(
      "Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  }
  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Reset your password — TEDxNewCairoSTEMYouth",
    html: buildPasswordResetHtml({ name, resetUrl, expiresInMinutes }),
  });

  if (error) {
    console.log(error);
    console.error("[sendPasswordResetEmail] Resend error:", error);
    throw new Error("Failed to send password reset email");
  }
}

function buildPasswordResetHtml({
  name,
  resetUrl,
  expiresInMinutes,
}: Omit<SendPasswordResetEmailParams, "to">): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#111111;border-radius:8px;border:1px solid #222222;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#e62b1e;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                TEDx<span style="opacity:0.7;">NewCairoSTEMYouth</span>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 16px;color:#ffffff;font-size:24px;font-weight:700;line-height:1.3;">
                Reset your password
              </h1>
              <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.6;">
                Hi ${name},
              </p>
              <p style="margin:0 0 32px;color:#aaaaaa;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your account.
                Click the button below to choose a new password.
                This link expires in <strong style="color:#ffffff;">${expiresInMinutes} minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="border-radius:6px;background:#e62b1e;">
                    <a href="${resetUrl}"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;
                             font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 8px;color:#666666;font-size:13px;">
                If the button doesn't work, copy this link into your browser:
              </p>
              <p style="margin:0 0 32px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#e62b1e;font-size:13px;">${resetUrl}</a>
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #222222;margin:0 0 24px;" />

              <p style="margin:0;color:#555555;font-size:13px;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#0d0d0d;border-top:1px solid #1a1a1a;">
              <p style="margin:0;color:#444444;font-size:12px;text-align:center;">
                TEDxNewCairoSTEMYouth · Luminous Darkness 2026
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
