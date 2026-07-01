import { handlers } from "@/auth";
import { aj } from "@/lib/arcjet";
import { tokenBucket } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

// Create a specialized Arcjet client for auth routes with stricter rate limiting
const ajAuth = aj.withRule(
  tokenBucket({
    mode: process.env.ARCJET_ENV === "development" ? "DRY_RUN" : "LIVE",
    refillRate: 5, // 5 requests per minute
    interval: 60, // 60 seconds
    capacity: 10, // burst capacity
  }),
);

async function withArcjetProtection(
  request: Request,
  handler: () => Promise<Response>,
) {
  const decision = await ajAuth.protect(request, { requested: 1 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "Request blocked by security policy" },
      { status: 403 },
    );
  }

  if (decision.isErrored()) {
    console.error("Arcjet error:", decision.reason);
    // Fail open - allow the request if Arcjet errors
  }

  return handler();
}

export async function GET(request: NextRequest) {
  return withArcjetProtection(request, () => handlers.GET(request));
}

export async function POST(request: NextRequest) {
  return withArcjetProtection(request, () => handlers.POST(request));
}
