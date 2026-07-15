// app/(root)/profile/page.tsx
// Server component — data fetched server-side, no client loading flicker.

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfile } from "@/lib/db/actions/profile.action";
import { ROUTES } from "@/constants/routes";
import { ProfileForm } from "./profile-form";
// import { TicketCard } from "./ticket-card";
import Image from "next/image";

export const metadata = {
  title: "My Profile — TEDxNewCairoSTEMYouth",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  if (!session.user.isActive) {
    redirect(ROUTES.LOGIN);
  }

  const profile = await getProfile();

  if (!profile) {
    redirect(ROUTES.LOGIN);
  }

  // Derive initials for avatar fallback
  const initials = (profile.fullName ?? profile.email)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-2xl px-4 pt-8">
        {/* ── Avatar + identity ──────────────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.fullName ?? "Avatar"}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
                width={64}
                height={64}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e62b1e]/15 ring-2 ring-[#e62b1e]/20">
                <span className="text-lg font-bold text-[#e62b1e]">
                  {initials || "?"}
                </span>
              </div>
            )}
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0a] bg-green-500" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-white">
              {profile.fullName ?? "Your Profile"}
            </h1>
            <p className="truncate text-sm text-white/40">{profile.email}</p>
            {profile.university && (
              <p className="mt-0.5 truncate text-xs text-white/25">
                {profile.university}
                {profile.major ? ` · ${profile.major}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* ── Ticket card (if confirmed or checked_in) ───────────────────────────────────── */}
        {/* {profile.ticket &&
          (profile.ticket.status === "confirmed" ||
            profile.ticket.status === "checked_in") && (
            <div className="mb-6">
              <TicketCard
                ticket={profile.ticket}
                attendeeName={profile.fullName ?? ""}
                attendeeEmail={profile.email}
              />
            </div>
          )} */}

        {/* ── Ticket under review/pending/rejected/cancelled state ───────────────────────────────────── */}
        {/* {profile.ticket &&
          profile.ticket.status !== "confirmed" &&
          profile.ticket.status !== "checked_in" && (
            <div className="mb-6 rounded-xl border border-white/10 bg-[#111111] p-5 text-center">
              <p className="mb-1 text-sm font-medium text-white/40">
                Ticket Status:{" "}
                {profile.ticket.status.replace(/_/g, " ").toUpperCase()}
              </p>
              <p className="text-xs text-white/20">
                {profile.ticket.status === "payment_submitted" &&
                  "Your payment is under review. You'll be notified once confirmed."}
                {profile.ticket.status === "pending_payment" &&
                  "Complete your payment to activate your ticket."}
                {profile.ticket.status === "rejected" &&
                  "Your payment was rejected. Please resubmit."}
                {profile.ticket.status === "cancelled" &&
                  "Your ticket has been cancelled."}
              </p>
              <a
                href={ROUTES.MY_TICKET}
                className="mt-3 inline-block rounded-md bg-[#e62b1e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#c42419]"
              >
                View Ticket Details
              </a>
            </div>
          )} */}

        {/* ── No ticket state ───────────────────────────────────────────── */}
        {/* {!profile.ticket && (
          <div className="mb-6 rounded-xl border border-dashed border-white/10 bg-transparent p-5 text-center">
            <p className="mb-1 text-sm font-medium text-white/40">
              No ticket yet
            </p>
            <p className="text-xs text-white/20">
              Register for the event to get your ticket.
            </p>
            <a
              href={ROUTES.REGISTER ?? "/register"}
              className="mt-3 inline-block rounded-md bg-[#e62b1e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#c42419]"
            >
              Get a ticket
            </a>
          </div>
        )} */}

        {/* ── Skills summary strip (read-only, above the form) ────────── */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/8 px-2.5 py-0.5 text-[11px] text-white/35"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* ── Section divider ───────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/6" />
          <span className="text-[10px] font-semibold uppercase tracking-[2px] text-white/20">
            Edit Profile
          </span>
          <div className="h-px flex-1 bg-white/6" />
        </div>

        {/* ── Profile edit form ────────────────────────────────────────── */}
        <ProfileForm profile={profile} />

        {/* ── Change password link (credentials users only) ────────────── */}
        {profile.isCredentialsUser && (
          <div className="mt-8 rounded-xl border border-white/6 bg-[#111111] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Password</p>
                <p className="text-xs text-white/30">
                  Change your account password
                </p>
              </div>
              <a
                href={ROUTES.FORGET_PASSWORD}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Change
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import TicketCard from "@/components/tickets/ticket-card";
