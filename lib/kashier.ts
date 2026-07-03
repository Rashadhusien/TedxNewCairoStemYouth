import { createHmac, timingSafeEqual } from "crypto";

export interface KashierSessionRequest {
  order: string;
  amount: string; // decimal string e.g. "300.00"
  currency?: string;
  display?: "ar" | "en";
  allowedMethods?: string;
  merchantRedirect: string;
  serverWebhook?: string;
  description?: string;
  customer?: {
    email: string;
    reference: string;
  };
}

export interface KashierSessionResponse {
  sessionUrl: string;
  sessionId: string;
}

export interface KashierSessionConflictError {
  error?: { cause?: string };
  messages?: { en?: string; ar?: string };
  status?: string;
  sessionUrl?: string;
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

  console.log("[Kashier] Config check:", {
    hasMerchantId: !!merchantId,
    hasApiKey: !!apiKey,
    hasSecretKey: !!secretKey,
    hasMode: !!mode,
    mode,
    merchantId: merchantId?.substring(0, 10) + "...",
    apiKey: apiKey?.substring(0, 10) + "...",
    secretKey: secretKey?.substring(0, 10) + "...",
  });

  console.log("secret key length:", secretKey?.length);

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
  const { mode } = getKashierConfig();
  return mode === "test"
    ? "https://test-api.kashier.io/v3/payment/sessions"
    : "https://api.kashier.io/v3/payment/sessions";
}

function getKashierPaymentUrl(): string {
  const { mode } = getKashierConfig();
  return mode === "test"
    ? "https://test-api.kashier.io/v3/payment/sessions"
    : "https://api.kashier.io/v3/payment/sessions";
}

export function generateKashierOrderHash(
  merchantOrderId: string,
  amount: string,
  currency: string,
): string {
  // Hash is now handled by Kashier API in the new Payment Sessions
  // This function is kept for backward compatibility
  const { merchantId, apiKey } = getKashierConfig();
  const path = `/?payment=${merchantId}.${merchantOrderId}.${amount}.${currency}`;
  const hash = createHmac("sha256", apiKey).update(path).digest("hex");
  return hash;
}

function extractSessionIdFromUrl(sessionUrl: string): string | null {
  const match = sessionUrl.match(/\/session\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export async function createKashierSession(
  req: KashierSessionRequest,
): Promise<KashierSessionResponse> {
  const { merchantId, secretKey, apiKey } = getKashierConfig();
  const baseUrl = getKashierBaseUrl();

  const currency = req.currency ?? "EGP";
  const expireAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const requestBody = {
    merchantId,
    order: req.order,
    amount: req.amount,
    currency,
    paymentType: "credit",
    type: "one-time",
    expireAt,
    maxFailureAttempts: 3,
    merchantRedirect: req.merchantRedirect,
    serverWebhook: req.serverWebhook,
    allowedMethods: req.allowedMethods ?? "card,wallet",
    display: req.display ?? "en",
    description: req.description || `Payment for order ${req.order}`,
    customer: req.customer,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: secretKey,
    "api-key": apiKey,
  };

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      let errorBody: KashierSessionConflictError | null = null;
      try {
        errorBody = JSON.parse(errorText) as KashierSessionConflictError;
      } catch {
        errorBody = null;
      }

      // Kashier refuses to open a second session for an order that already
      // has one in progress, but hands back that session's URL — reuse it
      // instead of failing the retry.
      if (errorBody?.sessionUrl && errorBody.status === "FAILURE") {
        const existingSessionId = extractSessionIdFromUrl(errorBody.sessionUrl);
        console.log(
          "[Kashier] Reusing existing open session for order:",
          req.order,
        );
        return {
          sessionUrl: errorBody.sessionUrl,
          sessionId: existingSessionId ?? req.order,
        };
      }

      console.error("[Kashier] API error:", response.status, errorText);
      throw new Error(`Kashier API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      sessionUrl: data.sessionUrl ?? data.data?.sessionUrl,
      sessionId: data._id ?? data.data?.sessionId,
    };
  } catch (error) {
    console.error("[Kashier] Session creation failed:", error);
    throw error;
  }
}

export function verifyKashierWebhookSignature(
  payload: KashierWebhookPayload,
  receivedSignature: string,
): boolean {
  const { apiKey } = getKashierConfig();
  const { data } = payload;

  console.log("[Kashier Webhook] Data keys:", Object.keys(data));
  console.log("[Kashier Webhook] Data values:", data);

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
      "mode",
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

  console.log("[Kashier Webhook] Signature check:", {
    signatureString,
    expectedSignature,
    receivedSignature,
  });

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

export async function getKashierSessionStatus(
  sessionId: string,
): Promise<{ status: string; data?: Record<string, unknown> }> {
  const { secretKey } = getKashierConfig();
  const baseUrl = getKashierPaymentUrl();

  try {
    const response = await fetch(`${baseUrl}/${sessionId}/payment`, {
      method: "GET",
      headers: {
        Authorization: secretKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Kashier] Status check error:",
        response.status,
        errorText,
      );
      throw new Error(`Kashier API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      status: data.data?.status || "UNKNOWN",
      data: data.data,
    };
  } catch (error) {
    console.error("[Kashier] Status check failed:", error);
    throw error;
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
