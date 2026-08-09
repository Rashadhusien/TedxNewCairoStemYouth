import { createHmac } from "crypto";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.KASHIER_API_KEY;
const secretKey = process.env.KASHIER_SECRET_KEY;

if (!apiKey) {
  throw new Error("KASHIER_API_KEY not set");
}
if (!secretKey) {
  throw new Error("KASHIER_SECRET_KEY not set");
}

// Simulate the webhook data from the logs
const webhookData: Record<string, string> = {
  paymentStatus: "SUCCESS",
  cardDataToken: "484b6815-a96e-4f93-b616-40ac0e02e484",
  maskedCard: "450875******1019",
  merchantOrderId: "1c8de598-8e2f-4b05-87c3-fd53eaedddbc",
  orderId: "765e22ee-da61-4a3c-bd01-8209bbaa5c8c",
  cardBrand: "Visa",
  orderReference: "TEST-ORD-193505305",
  transactionId: "TX-4665868279",
  amount: "1350",
  currency: "EGP",
  mode: "test",
};

const receivedSignature =
  "4c93e6471ccfcf4635ecfa7e17dea75b553696cbeaeb40c6a0726d69079fecae";

console.log("=== WEBHOOK DATA ===");
console.log(webhookData);
console.log("\n=== RECEIVED SIGNATURE ===");
console.log(receivedSignature);

// Test HPP signature calculation (no URL encoding)
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

const signatureString = keys
  .filter((key) => webhookData[key] !== undefined && webhookData[key] !== null)
  .map((key) => {
    const value = webhookData[key];
    return `${key}=${value}`;
  })
  .join("&");

console.log("\n=== SIGNATURE STRING (no encoding) ===");
console.log(signatureString);

const expectedSignature = createHmac("sha256", apiKey)
  .update(signatureString)
  .digest("hex");

console.log("\n=== EXPECTED SIGNATURE (no encoding) ===");
console.log(expectedSignature);
console.log("Match:", expectedSignature === receivedSignature);

// Test with URL encoding
const signatureStringEncoded = keys
  .filter((key) => webhookData[key] !== undefined && webhookData[key] !== null)
  .map((key) => {
    const value = webhookData[key];
    return `${key}=${encodeURIComponent(String(value))}`;
  })
  .join("&");

console.log("\n=== SIGNATURE STRING (with encoding) ===");
console.log(signatureStringEncoded);

const expectedSignatureEncoded = createHmac("sha256", apiKey)
  .update(signatureStringEncoded)
  .digest("hex");

console.log("\n=== EXPECTED SIGNATURE (with encoding) ===");
console.log(expectedSignatureEncoded);
console.log("Match:", expectedSignatureEncoded === receivedSignature);

// Test with different key order (alphabetical)
const sortedKeys = Object.keys(webhookData).sort();
const signatureStringSorted = sortedKeys
  .map((key) => {
    const value = webhookData[key];
    return `${key}=${value}`;
  })
  .join("&");

console.log("\n=== SIGNATURE STRING (sorted keys, no encoding) ===");
console.log(signatureStringSorted);

const expectedSignatureSorted = createHmac("sha256", apiKey)
  .update(signatureStringSorted)
  .digest("hex");

console.log("\n=== EXPECTED SIGNATURE (sorted keys, no encoding) ===");
console.log(expectedSignatureSorted);
console.log("Match:", expectedSignatureSorted === receivedSignature);

// Test with secret key instead of API key
const expectedSignatureSecretKey = createHmac("sha256", secretKey)
  .update(signatureString)
  .digest("hex");

console.log("\n=== EXPECTED SIGNATURE (secret key, no encoding) ===");
console.log(expectedSignatureSecretKey);
console.log("Match:", expectedSignatureSecretKey === receivedSignature);

// Test with secret key and encoding
const expectedSignatureSecretKeyEncoded = createHmac("sha256", secretKey)
  .update(signatureStringEncoded)
  .digest("hex");

console.log("\n=== EXPECTED SIGNATURE (secret key, with encoding) ===");
console.log(expectedSignatureSecretKeyEncoded);
console.log("Match:", expectedSignatureSecretKeyEncoded === receivedSignature);
