// Single Resend send path — same dev-mode fallback, same logging,
// same idempotency handling for every transactional email.

import logger from "@/lib/logger";

import { getResendClient } from "./resend";

export interface SendTransactionalEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  /** Required — pass a stable, deterministic key per logical send (e.g. `ticket-confirmed-${ticketId}`). */
  idempotencyKey: string;
  tags?: { name: string; value: string }[];
  attachments?: { filename: string; content: Buffer }[];
}

export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams,
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  const resend = getResendClient();
  const to = Array.isArray(params.to) ? params.to : [params.to];

  if (!resend || !from) {
    if (process.env.NODE_ENV === "development") {
      logger.info(
        { to, subject: params.subject },
        "[dev] Email not sent — set RESEND_API_KEY and EMAIL_FROM to send for real",
      );
      return;
    }
    throw new Error(
      "Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  }

  const { data, error } = await resend.emails.send(
    {
      from,
      to,
      subject: params.subject,
      html: params.html,
      tags: params.tags,
      attachments: params.attachments,
    },
    { idempotencyKey: params.idempotencyKey },
  );

  if (error) {
    logger.error(
      { err: error, to, subject: params.subject },
      "Failed to send email",
    );
    throw new Error(error.message);
  }

  logger.info({ emailId: data?.id, to, subject: params.subject }, "Email sent");
}
