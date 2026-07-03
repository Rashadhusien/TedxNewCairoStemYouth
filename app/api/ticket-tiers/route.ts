import { NextResponse } from "next/server";
import { getActiveTicketTiers } from "@/lib/db/actions/ticket-tier.action";

export async function GET() {
  try {
    const result = await getActiveTicketTiers();

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to fetch ticket tiers" },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching ticket tiers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
