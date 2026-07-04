// Single source of truth for TEDx transactional email styling.
// Callers are responsible for escaping any user-provided strings
// (name, email, ids, etc.) via `escapeHtml` before passing them
// into bodyHtml — this module does not escape anything itself.

export const COLORS = {
  bgOuter: "#0a0a0a",
  bgCard: "#111111",
  bgFooter: "#0d0d0d",
  border: "#222222",
  red: "#e62b1e",
  gold: "#C9A84C",
  textPrimary: "#ffffff",
  textSecondary: "#aaaaaa",
  textMuted: "#666666",
  textFaint: "#444444",
} as const;

export const FONTS = {
  display: `"Playfair Display", Georgia, 'Times New Roman', serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
  mono: `'Space Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`,
} as const;

export const EMAIL_WIDTH = 560;

export function renderButton(label: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="border-radius:6px;background:${COLORS.red};">
          <a href="${url}"
            style="display:inline-block;padding:14px 32px;color:${COLORS.textPrimary};
                   font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;
                   font-family:${FONTS.body};">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export interface EmailShellParams {
  /** Small uppercase label under the brand wordmark, e.g. "Admin alert" */
  eyebrow?: string;
  /** Main H1 heading in the card body */
  heading: string;
  /** Pre-escaped HTML for the card body (paragraphs, tables, etc.) */
  bodyHtml: string;
  /** Optional primary CTA button */
  cta?: { label: string; url: string };
  /** Optional small print under the CTA (fallback link, expiry note, etc.) */
  footNote?: string;
}

/**
 * Renders the shared TEDxNewCairoSTEMYouth email shell: same header,
 * footer, colors, fonts, width, and padding across every transactional
 * email in the app.
 */
export function renderEmailShell({
  eyebrow,
  heading,
  bodyHtml,
  cta,
  footNote,
}: EmailShellParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
  <!--[if !mso]><!-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:${COLORS.bgOuter};font-family:${FONTS.body};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bgOuter};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="${EMAIL_WIDTH}" cellpadding="0" cellspacing="0"
          style="background:${COLORS.bgCard};border-radius:8px;border:1px solid ${COLORS.border};
                 overflow:hidden;max-width:${EMAIL_WIDTH}px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${COLORS.red};padding:24px 32px;">
              <p style="margin:0;color:${COLORS.textPrimary};font-size:13px;letter-spacing:2px;
                        text-transform:uppercase;font-weight:700;font-family:${FONTS.body};">
                TEDx<span style="opacity:0.7;">NewCairoSTEMYouth</span>
              </p>
              ${
                eyebrow
                  ? `<p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:11px;
                        letter-spacing:1px;text-transform:uppercase;font-family:${FONTS.body};">
                       ${eyebrow}
                     </p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 24px;color:${COLORS.textPrimary};font-size:24px;font-weight:700;
                        line-height:1.3;font-family:${FONTS.display};">
                ${heading}
              </h1>
              ${bodyHtml}
              ${cta ? renderButton(cta.label, cta.url) : ""}
              ${
                footNote
                  ? `<p style="margin:0 0 8px;color:${COLORS.textMuted};font-size:13px;line-height:1.6;">
                       ${footNote}
                     </p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:${COLORS.bgFooter};border-top:1px solid #1a1a1a;">
              <p style="margin:0;color:${COLORS.textFaint};font-size:12px;text-align:center;font-family:${FONTS.body};">
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
