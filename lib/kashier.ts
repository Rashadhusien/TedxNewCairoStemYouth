import { createHmac, timingSafeEqual } from "crypto";

export interface KashierSessionRequest {
  order: string;
  amount: string; // decimal string e.g. "300.00"
  currency?: string;
  display?: "ar" | "en";
  allowedMethods?: string;
  merchantRedirect: string;
}

export interface KashierSessionResponse {
  sessionUrl: string;
}

export interface KashierWebhookPayload {
  data: Record<string, string | number | boolean | null> & {
    merchantOrderId: string;
    orderId?: string;
    amount: string | number; // in piasters
    currency: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
    signatureKeys: string[];
  };
}

function getKashierConfig() {
  const merchantId = process.env.KASHIER_MERCHANT_ID;
  const apiKey = process.env.KASHIER_API_KEY;
  const secretKey = process.env.KASHIER_SECRET_KEY;
  const mode = process.env.KASHIER_MODE;

  if (!merchantId) {
    throw new Error("Missing KASHIER_MERCHANT_ID environment variable");
  }
  if (!apiKey) {
    throw new Error("Missing KASHIER_API_KEY environment variable");
  }
  if (!secretKey) {
    throw new Error("Missing KASHIER_SECRET_KEY environment variable");
  }
  if (!mode || (mode !== "test" && mode !== "live")) {
    throw new Error('KASHIER_MODE must be set to either "test" or "live"');
  }

  return { merchantId, apiKey, secretKey, mode };
}

function getKashierBaseUrl(): string {
  return "https://checkout.kashier.io";
}

export function generateKashierOrderHash(
  merchantOrderId: string,
  amount: string,
  currency: string,
): string {
  const { merchantId, apiKey } = getKashierConfig();

  const path = `/?payment=${merchantId}.${merchantOrderId}.${amount}.${currency}`;
  const hash = createHmac("sha256", apiKey).update(path).digest("hex");

  return hash;
}

export async function createKashierSession(
  req: KashierSessionRequest,
): Promise<KashierSessionResponse> {
  const { merchantId, mode } = getKashierConfig();
  const baseUrl = getKashierBaseUrl();

  const currency = req.currency ?? "EGP";
  const hash = generateKashierOrderHash(req.order, req.amount, currency);

  const params = new URLSearchParams({
    merchantId,
    orderId: req.order,
    amount: req.amount,
    currency,
    hash,
    merchantRedirect: req.merchantRedirect,
    allowedMethods: req.allowedMethods ?? "card,wallet",
    display: req.display ?? "en",
    mode,
  });

  const sessionUrl = `${baseUrl}?${params.toString()}`;

  return { sessionUrl };
}

export function verifyKashierWebhookSignature(
  payload: KashierWebhookPayload,
  receivedSignature: string,
): boolean {
  const { apiKey } = getKashierConfig();
  const { data } = payload;

  let signatureString = "";
  const signatureKeys = data.signatureKeys;

  if (signatureKeys && Array.isArray(signatureKeys)) {
    // Handle API case with signatureKeys
    const sortedKeys = [...signatureKeys].sort();
    signatureString = sortedKeys
      .map((key) => {
        const value = data[key];
        return `${key}=${encodeURIComponent(String(value ?? ""))}`;
      })
      .join("&");
  } else {
    // Handle HPP case with fixed keys
    const keys = [
      "paymentStatus",
      "cardDataToken",
      "maskedCard",
      "merchantOrderId",
      "orderId",
      "cardBrand",
      "orderReference",
      "transactionId",
      "amount",
      "currency",
    ];

    signatureString = keys
      .filter((key) => data[key] !== undefined && data[key] !== null)
      .map((key) => {
        const value = data[key];
        return `${key}=${value}`;
      })
      .join("&");
  }

  const expectedSignature = createHmac("sha256", apiKey)
    .update(signatureString)
    .digest("hex");

  try {
    const receivedBuffer = Buffer.from(receivedSignature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch (error) {
    console.error("[Kashier] Signature comparison error:", error);
    return false;
  }
}

export function piastresToKashierAmount(piastres: number): string {
  const egp = piastres / 100;
  return egp.toFixed(2);
}

export function kashierAmountToPiastres(amount: string): number {
  const egp = parseFloat(amount);
  if (isNaN(egp)) {
    throw new Error(`Invalid Kashier amount: ${amount}`);
  }
  return Math.round(egp * 100);
}
