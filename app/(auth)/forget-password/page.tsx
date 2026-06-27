// app/(auth)/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import {
  ForgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation";
import { ROUTES } from "@/constants/routes";
import { forgotPassword } from "@/lib/db/actions/password-reset.actions";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    const result = await forgotPassword({ email: data.email });

    if (!result.success) {
      setError("email", { message: result.error.message });
      return;
    }

    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
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

          <div className="rounded-lg border border-white/10 bg-[#111111] p-8 text-center">
            {/* Envelope icon */}
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#e62b1e]/10 ring-1 ring-[#e62b1e]/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e62b1e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <h1 className="mb-2 text-xl font-semibold text-white">
              Check your inbox
            </h1>
            <p className="mb-1 text-sm text-white/50">
              We sent a reset link to
            </p>
            <p className="mb-6 text-sm font-medium text-white">
              {submittedEmail}
            </p>
            <p className="mb-8 text-xs text-white/30 leading-relaxed">
              The link expires in 30 minutes. If you don&apos;t see the email,
              check your spam folder.
            </p>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline transition-colors"
            >
              Try a different email
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            Remembered it?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="text-white/50 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
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

        <div className="rounded-lg border border-white/10 bg-[#111111] p-8">
          <div className="mb-6">
            <h1 className="mb-1 text-xl font-semibold text-white">
              Forgot your password?
            </h1>
            <p className="text-sm text-white/40">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50"
              >
                Email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#e62b1e]/60 focus:ring-1 focus:ring-[#e62b1e]/30 disabled:opacity-50"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#e62b1e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c42419] focus:outline-none focus:ring-2 focus:ring-[#e62b1e]/50 focus:ring-offset-2 focus:ring-offset-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Remembered it?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-white/50 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
