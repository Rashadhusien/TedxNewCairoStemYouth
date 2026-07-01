"use client";

import {
  PostHogProvider as PHProvider,
  usePostHog as usePH,
} from "posthog-js/react";
import posthog from "posthog-js";
import type { TedxEventName, TedxEventProperties } from "./events";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: process.env.NODE_ENV !== "production",
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function useAnalytics() {
  const posthog = usePH();

  return {
    capture<E extends TedxEventName>(
      event: E,
      properties: TedxEventProperties<E>,
    ): void {
      posthog.capture(event, properties as Record<string, unknown>);
    },

    identify(
      distinctId: string,
      traits?: {
        email?: string;
        name?: string;
        ticket_type?: string;
        has_ticket?: boolean;
        is_admin?: boolean;
      },
    ): void {
      posthog.identify(distinctId, traits);
    },

    reset(): void {
      posthog.reset();
    },
  };
}
