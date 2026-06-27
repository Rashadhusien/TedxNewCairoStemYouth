// app/(auth)/reset-password/reset-password-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { resetPassword } from "@/lib/db/actions/password-reset.actions";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/lib/validation";
import { ROUTES } from "@/constants/routes";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token },
  });

  const password = watch("password", "");

  const onSubmit = async (data: ResetPasswordInput) => {
    const result = await resetPassword(data);

    if (!result.success) {
      // Token expired mid-session — surface on the token field,
      // which maps to a root-level error in the UI
      setError("root", { message: result.error.message });
      return;
    }

    setDone(true);
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#111111] p-8 text-center">
        {/* Check icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="mb-2 text-xl font-semibold text-white">
          Password updated
        </h1>
        <p className="mb-8 text-sm text-white/40 leading-relaxed">
          Your password has been changed. You can now sign in with your new
          password.
        </p>

        <Link
          href={ROUTES.LOGIN}
          className="inline-block w-full rounded-md bg-[#e62b1e] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#c42419]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────
  return (
    <div className="rounded-lg border border-white/10 bg-[#111111] p-8">
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-semibold text-white">
          Choose a new password
        </h1>
        <p className="text-sm text-white/40">
          Must be at least 8 characters with uppercase, lowercase, and a number.
        </p>
      </div>

      {/* Hidden token field */}
      <input type="hidden" {...register("token")} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Root / token error */}
        {errors.root && (
          <div className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-red-400">{errors.root.message}</p>
            <a
              href={ROUTES.FORGOT_PASSWORD}
              className="mt-1 block text-xs text-red-400/70 underline hover:text-red-400"
            >
              Request a new link
            </a>
          </div>
        )}

        {/* New password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50"
          >
            New password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#e62b1e]/60 focus:ring-1 focus:ring-[#e62b1e]/30 disabled:opacity-50"
              disabled={isSubmitting}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Strength indicator */}
          {password.length > 0 && <PasswordStrength password={password} />}

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#e62b1e]/60 focus:ring-1 focus:ring-[#e62b1e]/30 disabled:opacity-50"
              disabled={isSubmitting}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#e62b1e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c42419] focus:outline-none focus:ring-2 focus:ring-[#e62b1e]/50 focus:ring-offset-2 focus:ring-offset-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>

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
  );
}

// ── Password strength meter ──────────────────────────────────────────────────

function getStrength(password: string): {
  score: number; // 0–4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Clamp to 4
  score = Math.min(score, 4);

  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too weak", color: "#ef4444" },
    1: { label: "Weak", color: "#f97316" },
    2: { label: "Fair", color: "#eab308" },
    3: { label: "Good", color: "#22c55e" },
    4: { label: "Strong", color: "#16a34a" },
  };

  return { score, ...map[score] };
}

function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < score ? color : "#333333",
            }}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px]" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

// ── Inline SVG icons (no extra dep) ─────────────────────────────────────────

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
