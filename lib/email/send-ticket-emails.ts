import QRCode from "qrcode";

import { ROUTES } from "@/constants/routes";
import logger from "@/lib/logger";
import { formatPiastres } from "@/lib/pricing";

import { getAppUrl } from "./app-url";
import { escapeHtml } from "./escape-html";
import { getAdminNotificationEmails } from "./get-admin-emails";
import { renderEmailShell } from "./design-system";
import { sendTransactionalEmail } from "./send";

type TicketEmailContext = {
  ticketId: string;
  attendeeName: string;
  attendeeEmail: string;
  packageName: string;
  pricePaid: number;
  qrCode?: string;
  ticketType?: string;
  paymentMethod?: string | null;
  rejectionReason?: string | null;
};

function detailsRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;color:#777;font-size:14px;">${label}</td>
      <td style="padding:8px 0;color:#eaeaea;font-size:14px;font-family:'Space Mono','SFMono-Regular',Consolas,monospace;">
        ${value}
      </td>
    </tr>
  `;
}

export async function sendTicketSubmittedAdminEmail(
  ctx: TicketEmailContext,
): Promise<void> {
  const adminEmails = await getAdminNotificationEmails();
  if (!adminEmails.length) {
    logger.warn(
      "No admin notification emails configured — skipping admin alert",
    );
    return;
  }

  const appUrl = getAppUrl();
  const reviewUrl = `${appUrl}${ROUTES.ADMIN.TICKETS}`;
  const name = escapeHtml(ctx.attendeeName);
  const email = escapeHtml(ctx.attendeeEmail);
  const method = escapeHtml(ctx.paymentMethod ?? "—");

  const bodyHtml = `
    <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.6;">
      A new ticket payment is awaiting your review.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 32px;">
      ${detailsRow("Attendee", `<strong style="color:#fff;">${name}</strong>`)}
      ${detailsRow("Email", email)}
      ${detailsRow("Package", escapeHtml(ctx.packageName))}
      ${detailsRow("Amount", escapeHtml(formatPiastres(ctx.pricePaid)))}
      ${detailsRow("Payment method", method)}
    </table>
  `;

  const html = renderEmailShell({
    eyebrow: "Admin alert",
    heading: "New ticket payment submitted",
    bodyHtml,
    cta: { label: "Review in admin panel", url: reviewUrl },
  });

  await sendTransactionalEmail({
    to: adminEmails,
    subject: `[TEDx] New ticket submission — ${ctx.attendeeName}`,
    html,
    idempotencyKey: `ticket-submitted-admin-${ctx.ticketId}`,
    tags: [{ name: "category", value: "ticket_submitted_admin" }],
  });
}

export async function sendTicketConfirmedAttendeeEmail(
  ctx: TicketEmailContext,
): Promise<void> {
  if (!ctx.qrCode) {
    throw new Error("QR code is required for confirmed ticket email");
  }

  const appUrl = getAppUrl();
  const myTicketUrl = `${appUrl}${ROUTES.PROFILE}`;
  const name = escapeHtml(ctx.attendeeName);
  const isVip = ctx.ticketType === "vip";
  const qrBuffer = await QRCode.toBuffer(ctx.qrCode, {
    width: 280,
    margin: 2,
    type: "png",
  });

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#aaaaaa;font-size:15px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.6;">
      Great news — your payment has been approved and your ticket for
      <strong style="color:#fff;">Luminous Darkness 2026</strong> is confirmed.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
      ${detailsRow("Package", `<strong style="color:#fff;">${escapeHtml(ctx.packageName)}</strong>`)}
      ${isVip ? detailsRow("Ticket type", '<strong style="color:#fff;">VIP</strong>') : ""}
      ${detailsRow("Amount paid", escapeHtml(formatPiastres(ctx.pricePaid)))}
      ${detailsRow("Ticket ID", escapeHtml(ctx.qrCode))}
    </table>
    <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.6;">
      Your QR code is attached to this email. Present it at the venue entrance on event day.
    </p>
    ${
      isVip
        ? `<p style="margin:0 0 24px;color:#d4af37;font-size:15px;line-height:1.6;">
      <strong>VIP ticket:</strong> you have reserved front seating. Please arrive early and present your QR code at the VIP entrance.
    </p>`
        : ""
    }
  `;

  const html = renderEmailShell({
    eyebrow: "Ticket confirmed",
    heading: "Your ticket is confirmed!",
    bodyHtml,
    cta: { label: "View my ticket online", url: myTicketUrl },
  });

  await sendTransactionalEmail({
    to: ctx.attendeeEmail,
    subject: "Your TEDx ticket is confirmed — Luminous Darkness 2026",
    html,
    idempotencyKey: `ticket-confirmed-${ctx.ticketId}`,
    tags: [{ name: "category", value: "ticket_confirmed" }],
    attachments: [
      {
        filename: `tedx-ticket-${ctx.qrCode.slice(0, 8)}.png`,
        content: qrBuffer,
      },
    ],
  });
}

export async function sendTicketRejectedAttendeeEmail(
  ctx: TicketEmailContext,
): Promise<void> {
  const appUrl = getAppUrl();
  const myTicketUrl = `${appUrl}${ROUTES.PROFILE}`;
  const name = escapeHtml(ctx.attendeeName);
  const reason = escapeHtml(
    ctx.rejectionReason?.trim() || "No reason provided.",
  );

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#aaaaaa;font-size:15px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.6;">
      We reviewed your payment proof for the
      <strong style="color:#fff;">${escapeHtml(ctx.packageName)}</strong> package,
      but we were unable to confirm it.
    </p>
    <div style="background:#1a0f0e;border-left:4px solid #e62b1e;padding:12px 16px;margin:0 0 24px;">
      <p style="margin:0;color:#eaeaea;font-size:14px;"><strong>Reason:</strong> ${reason}</p>
    </div>
    <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.6;">
      You can upload a new payment screenshot from your ticket page and we'll review it again.
    </p>
  `;

  const html = renderEmailShell({
    eyebrow: "Action required",
    heading: "Payment not accepted",
    bodyHtml,
    cta: { label: "Resubmit payment proof", url: myTicketUrl },
  });

  await sendTransactionalEmail({
    to: ctx.attendeeEmail,
    subject: "Action required — TEDx ticket payment not accepted",
    html,
    idempotencyKey: `ticket-rejected-${ctx.ticketId}`,
    tags: [{ name: "category", value: "ticket_rejected" }],
  });
}

/** Fire-and-forget wrappers — email failures must not block ticket actions. */
export function notifyTicketSubmitted(ctx: TicketEmailContext): void {
  void sendTicketSubmittedAdminEmail(ctx).catch((error: unknown) => {
    logger.error(
      { err: error, ticketId: ctx.ticketId },
      "Admin ticket alert failed",
    );
  });
}

export function notifyTicketConfirmed(ctx: TicketEmailContext): void {
  void sendTicketConfirmedAttendeeEmail(ctx).catch((error: unknown) => {
    logger.error(
      { err: error, ticketId: ctx.ticketId },
      "Ticket confirmed email failed",
    );
  });
}

export function notifyTicketRejected(ctx: TicketEmailContext): void {
  void sendTicketRejectedAttendeeEmail(ctx).catch((error: unknown) => {
    logger.error(
      { err: error, ticketId: ctx.ticketId },
      "Ticket rejected email failed",
    );
  });
}
