import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";

// Fallback base host used only for orders created before the exact session URL
// was persisted. Matches the hosted checkout URL Kashier's API returns.
const KASHIER_CHECKOUT_BASE = "https://payments.kashier.io";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(
      "kashier-checkout",
      session.user.id,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Too many attempts. Try again in ${rateLimitResult.retryAfterSeconds} seconds.`,
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Fetch the order with its Kashier session reference
    const [order] = await db
      .select({
        kashierSessionId: orders.kashierSessionId,
        kashierSessionUrl: orders.kashierSessionUrl,
        userId: orders.userId,
        status: orders.status,
      })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Order is not in pending payment status" },
        { status: 400 },
      );
    }

    if (!order.kashierSessionId) {
      return NextResponse.json(
        { error: "No Kashier session found for this order" },
        { status: 400 },
      );
    }

    // Prefer the exact hosted checkout URL Kashier returned when the session
    // was created. Reconstructing the URL manually produced an invalid URL and
    // bounced users back to the merchant redirect (the ticket page).
    let sessionUrl = order.kashierSessionUrl;

    if (!sessionUrl) {
      const mode = process.env.KASHIER_MODE || "test";
      const modeParam = mode === "test" ? "?mode=test" : "";
      sessionUrl = `${KASHIER_CHECKOUT_BASE}/session/${order.kashierSessionId}${modeParam}`;
    }

    return NextResponse.json({
      success: true,
      sessionUrl,
    });
  } catch (error) {
    console.error("[Resume Kashier] Error:", error);
    return NextResponse.json(
      { error: "Failed to resume payment session" },
      { status: 500 },
    );
  }
}
