import { PostHog } from "posthog-node";
import type { TedxEventName, TedxEventProperties } from "./events";

let _client: PostHog | null = null;

function getClient(): PostHog {
  if (_client) {
    return _client;
  }

  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST;

  if (!apiKey || !host) {
    throw new Error("POSTHOG_API_KEY and POSTHOG_HOST must be set");
  }

  _client = new PostHog(apiKey, {
    host,
    flushAt: 20,
    flushInterval: 10_000,
  });

  return _client;
}

export const serverAnalytics = {
  capture<E extends TedxEventName>(
    event: E,
    distinctId: string,
    properties: TedxEventProperties<E>,
  ): void {
    try {
      getClient().capture({
        distinctId,
        event,
        properties: properties as Record<string, unknown>,
      });
    } catch (error) {
      console.error("[analytics]", error);
    }
  },

  identify(
    distinctId: string,
    traits: {
      email?: string;
      name?: string;
      ticket_type?: string;
      has_ticket?: boolean;
      is_admin?: boolean;
    },
  ): void {
    try {
      getClient().identify({
        distinctId,
        properties: traits,
      });
    } catch (error) {
      console.error("[analytics]", error);
    }
  },

  async shutdown(): Promise<void> {
    if (_client) {
      try {
        await _client.shutdown();
      } catch (error) {
        console.error("[analytics]", error);
      }
    }
  },
};
