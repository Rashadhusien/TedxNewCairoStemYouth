"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAnalytics } from "@/lib/analytics/client";

export function SessionIdentifier() {
  const { data: session } = useSession();
  const { identify } = useAnalytics();
  useEffect(() => {
    if (session?.user?.id) {
      identify(session.user.id, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      });
    }
  }, [session?.user?.id]);
  return null;
}
