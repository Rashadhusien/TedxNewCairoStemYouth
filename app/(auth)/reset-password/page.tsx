// app/(auth)/reset-password/page.tsx
// Server component: validates token server-side before rendering the form.
// If invalid, shows an error state immediately — no client-side flash.

import { redirect } from "next/navigation";
import { validateResetToken } from "@/lib/db/actions/password-reset.actions";
import { ROUTES } from "@/constants/routes";
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  // No token in URL at all → redirect to forgot-password
  if (!token) {
    redirect(ROUTES.FORGET_PASSWORD);
  }

  const validation = await validateResetToken(token);

  return (
    <div className="flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        {/* TED mark */}
        <div className="mb-8 text-center">
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#e62b1e]">
            TEDx
          </span>
          <span className="text-[11px] tracking-[3px] uppercase text-white/30">
            NewCairoSTEMYouth
          </span>
        </div>

        {validation.valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <InvalidTokenState reason={validation.reason} />
        )}
      </div>
    </div>
  );
}

// ── Invalid / expired token state ──────────────────────────────────────────

function InvalidTokenState({ reason }: { reason: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111111] p-8 text-center">
      {/* Warning icon */}
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" x2="12" y1="9" y2="13" />
          <line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
      </div>

      <h1 className="mb-2 text-xl font-semibold text-white">Link expired</h1>
      <p className="mb-8 text-sm text-white/40 leading-relaxed">{reason}</p>

      <a
        href={ROUTES.FORGET_PASSWORD}
        className="inline-block w-full rounded-md bg-[#e62b1e] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#c42419]"
      >
        Request a new link
      </a>

      <p className="mt-6 text-xs text-white/30">
        Need help?{" "}
        <a
          href="mailto:info@tedxnewcairostemyouth.org"
          className="text-white/50 hover:text-white transition-colors"
        >
          Contact us
        </a>
      </p>
    </div>
  );
}
