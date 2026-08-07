import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/db/actions/promo-code.action";
import { ValidatePromoCodeSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = ValidatePromoCodeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const result = await validatePromoCode(validationResult.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Promo Code Validate] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
