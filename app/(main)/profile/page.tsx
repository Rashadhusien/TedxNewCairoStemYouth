// app/(root)/profile/page.tsx
// Server component — data fetched server-side, no client loading flicker.

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfile } from "@/lib/db/actions/profile.action";
import { getActiveOffers } from "@/lib/db/actions/offer.action";
import { getMyTicket } from "@/lib/db/actions/ticket.action";
import { ROUTES } from "@/constants/routes";
import { ProfileForm } from "./profile-form";
import Image from "next/image";
import MyTicketClient from "@/components/tickets/my-ticket-client";
import { ContinuePaymentButton } from "@/components/continue-payment-button";

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

  const [ticketResult, offersResult] = await Promise.all([
    getMyTicket(),
    getActiveOffers(),
  ]);

  const ticketData =
    ticketResult.success && ticketResult.data !== undefined
      ? ticketResult.data
      : null;

  const offers =
    offersResult.success && offersResult.data ? offersResult.data : [];

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

        {/* ── Orders section ───────────────────────────────────────────── */}
        {profile.orders && profile.orders.length > 0 && (
          <div className="mb-6 space-y-4">
            <h2 className="text-sm font-semibold text-white/60">Your Orders</h2>
            {profile.orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-white/10 bg-[#111111] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {order.packageName}
                    </p>
                    <p className="text-xs text-white/40">
                      {order.packageTicketCount} ticket
                      {order.packageTicketCount > 1 ? "s" : ""} · Order ID:{" "}
                      {order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {(order.finalAmountPiastres / 100).toFixed(2)} EGP
                    </p>
                    <p
                      className={`text-xs ${
                        order.status === "paid"
                          ? "text-green-400"
                          : order.status === "failed"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {order.status.replace(/_/g, " ").toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Order tickets */}
                {order.tickets.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                    <p className="text-xs font-medium text-white/50">Tickets</p>
                    {order.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between rounded-lg bg-white/5 p-2"
                      >
                        <div>
                          <p className="text-xs font-medium text-white">
                            {ticket.attendeeName || "Attendee"}
                          </p>
                          <p className="text-xs text-white/40">
                            {ticket.attendeeEmail || profile.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xs font-medium ${
                              ticket.status === "confirmed" ||
                              ticket.status === "checked_in"
                                ? "text-green-400"
                                : ticket.status === "rejected"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                            }`}
                          >
                            {ticket.status.replace(/_/g, " ").toUpperCase()}
                          </p>
                          {ticket.qrCode && (
                            <p className="text-xs text-white/30">
                              QR Code available
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order actions */}
                {order.status === "pending_payment" && (
                  <ContinuePaymentButton orderId={order.id} />
                )}
              </div>
            ))}
          </div>
        )}

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

        {/* ── Ticket display (using MyTicketClient) ───────────────────────────────────── */}
        <div className="mb-6">
          <MyTicketClient
            data={ticketData}
            offers={offers}
            packageName={ticketData?.order?.packageName}
            promoCode={ticketData?.order?.promoCode}
            originalAmountPiastres={ticketData?.order?.originalAmountPiastres}
            discountPiastres={ticketData?.order?.discountPiastres}
          />
        </div>

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
