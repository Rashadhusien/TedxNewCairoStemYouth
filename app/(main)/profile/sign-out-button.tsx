// app/(root)/profile/sign-out-button.tsx
// Isolated client component — keeps the parent page a server component.
"use client";

import { signOutAction } from "@/lib/db/actions/auth.action";
import { useTransition } from "react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
      className="rounded-md px-3 py-1.5 text-xs font-medium text-white/35 transition hover:bg-white/5 hover:text-white/60 disabled:opacity-50"
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
