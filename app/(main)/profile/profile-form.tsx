// app/(root)/profile/profile-form.tsx
"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateProfile } from "@/lib/db/actions/profile.action";
import {
  UpdateProfileSchema,
  type UpdateProfileInput,
  SKILLS_OPTIONS,
} from "@/lib/validation";

import type { ProfileData } from "@/lib/db/actions/profile.action";
import { Checkbox } from "radix-ui";
import { Field, FieldError } from "@/components/ui/field";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

type ProfileFormProps = {
  profile: ProfileData;
};

// ── Graduation year options ───────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR + i - 2);

// ── Field primitives ──────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-white/40">
      {children}
    </label>
  );
}

function FieldInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input
        {...props}
        className="w-full rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-[#e62b1e]/50 focus:ring-1 focus:ring-[#e62b1e]/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </>
  );
}

function FieldSelect({
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <select
        {...props}
        className="w-full appearance-none rounded-lg border border-white/8 bg-[#111111] px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#e62b1e]/50 focus:ring-1 focus:ring-[#e62b1e]/20 disabled:opacity-50"
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </>
  );
}

// ── Skills multi-select pill group ────────────────────────────────────────────
function SkillsSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (skills: string[]) => void;
}) {
  const toggle = (skill: string) => {
    onChange(
      selected.includes(skill)
        ? selected.filter((s) => s !== skill)
        : [...selected, skill],
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SKILLS_OPTIONS.map((skill) => {
        const active = selected.includes(skill);
        return (
          <button
            key={skill}
            type="button"
            onClick={() => toggle(skill)}
            className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
            style={{
              borderColor: active
                ? "rgba(230,43,30,0.6)"
                : "rgba(255,255,255,0.08)",
              backgroundColor: active ? "rgba(230,43,30,0.12)" : "transparent",
              color: active ? "#e62b1e" : "rgba(255,255,255,0.35)",
            }}
          >
            {skill}
          </button>
        );
      })}
    </div>
  );
}

// ── Save feedback ────────────────────────────────────────────────────────────
type SaveState = "idle" | "saving" | "saved" | "error";

// ── Main component ────────────────────────────────────────────────────────────
export function ProfileForm({ profile }: ProfileFormProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      fullName: profile.fullName ?? "",
      phone: profile.phone ?? "",
      university: profile.university ?? "",
      major: profile.major ?? "",
      graduationYear: profile.graduationYear ?? null,
      age: profile.age ?? null,
      skills: profile.skills ?? [],
    },
  });

  const selectedSkills = watch("skills") ?? [];

  const onSubmit = (data: UpdateProfileInput) => {
    setSaveState("saving");
    setErrorMessage("");

    startTransition(async () => {
      const result = await updateProfile(data);

      if (!result.success) {
        setSaveState("error");
        setErrorMessage(result.error.message);
        return;
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    });
  };

  const isLoading = saveState === "saving" || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* ── Section: Personal info ────────────────────────────── */}
      <section className="mb-6 rounded-xl border border-white/8 bg-[#111111] p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-white/30">
          Personal Info
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full name */}
          <div className="sm:col-span-2">
            <FieldLabel>Full Name</FieldLabel>
            <FieldInput
              {...register("fullName")}
              placeholder="Your full name"
              disabled={isLoading}
              error={errors.fullName?.message}
            />
          </div>

          {/* Email — read-only */}
          <div className="sm:col-span-2">
            <FieldLabel>Email</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={profile.email}
                readOnly
                disabled
                className="w-full rounded-lg border border-white/6 bg-white/2 px-4 py-2.5 text-sm text-white/30 outline-none cursor-not-allowed"
              />
              <span className="shrink-0 rounded-md border border-white/8 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/25">
                Locked
              </span>
            </div>
            <p className="mt-1 text-[11px] text-white/20">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div>
            <FieldLabel>Phone</FieldLabel>
            <FieldInput
              {...register("phone")}
              type="tel"
              placeholder="+20 10 0000 0000"
              disabled={isLoading}
              error={errors.phone?.message}
            />
          </div>

          {/* Age */}
          <div>
            <FieldLabel>Age</FieldLabel>
            <FieldInput
              {...register("age", {
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
              })}
              type="number"
              min={16}
              max={100}
              placeholder="e.g. 21"
              disabled={isLoading}
              error={errors.age?.message}
            />
          </div>
        </div>
      </section>

      {/* ── Section: Academic info ────────────────────────────── */}
      <section className="mb-6 rounded-xl border border-white/8 bg-[#111111] p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-white/30">
          Academic Info
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* University */}
          <div>
            <FieldLabel>University</FieldLabel>
            <FieldInput
              {...register("university")}
              placeholder="e.g. Ain Shams University"
              disabled={isLoading}
              error={errors.university?.message}
            />
          </div>

          {/* Major */}
          <div>
            <FieldLabel>Major</FieldLabel>
            <FieldInput
              {...register("major")}
              placeholder="e.g. Computer Engineering"
              disabled={isLoading}
              error={errors.major?.message}
            />
          </div>

          {/* Graduation year */}
          <div>
            <FieldLabel>Graduation Year</FieldLabel>
            <FieldSelect
              {...register("graduationYear", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
              disabled={isLoading}
              error={errors.graduationYear?.message}
            >
              <option value="">Select year</option>
              {GRAD_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </FieldSelect>
          </div>
        </div>
      </section>

      {/* ── Section: Skills ───────────────────────────────────── */}
      <section className="mb-6 rounded-xl border border-white/8 bg-[#111111] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[2px] text-white/30">
            Skills & Interests
          </h2>
          {selectedSkills.length > 0 && (
            <span className="rounded-full bg-[#e62b1e]/15 px-2 py-0.5 text-[10px] font-semibold text-[#e62b1e]">
              {selectedSkills.length} selected
            </span>
          )}
        </div>
        <SkillsSelector
          selected={selectedSkills}
          onChange={(skills) =>
            setValue("skills", skills, { shouldDirty: true })
          }
        />
      </section>

      {/* ── Error banner ──────────────────────────────────────── */}
      {saveState === "error" && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3">
          <p className="text-xs text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* ── Submit row ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        {saveState === "saved" && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
            <CheckIcon className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        {saveState !== "saved" && <span />}

        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className="rounded-lg bg-[#e62b1e] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#c42419] focus:outline-none focus:ring-2 focus:ring-[#e62b1e]/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
