/**
 * Cloudinary upload helpers — server-side only.
 * Used for generating signed upload parameters for payment screenshots.
 *
 * Never import this in client components.
 */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true,
});

export { cloudinary };

/** Shape returned by generateUploadSignature */
export interface CloudinarySignaturePayload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  /** Pass these back verbatim to the Cloudinary upload endpoint */
  uploadParams: {
    timestamp: number;
    folder: string;
    tags: string;
  };
}

/**
 * Generate a short-lived signed upload signature for client-side direct upload.
 * Called from a Server Action or API route — never exposed to the client raw.
 *
 * @param userId  The authenticated user's UUID (embedded in the folder path)
 */
export function generatePaymentUploadSignature(
  userId: string,
): CloudinarySignaturePayload {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `tedx/payment_screenshots/${userId}`;

  // Only sign params Cloudinary includes in signature verification.
  // allowed_formats / max_file_size cause Invalid Signature (401).
  const uploadParams = {
    timestamp,
    folder,
    tags: "payment_proof",
  };

  const signature = cloudinary.utils.api_sign_request(
    uploadParams,
    process.env.CLOUDINARY_API_SECRET?.trim()!,
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY?.trim()!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim()!,
    folder,
    uploadParams,
  };
}

/**
 * Delete a Cloudinary asset by its public_id.
 * Called when an admin rejects a payment and the user re-uploads.
 */
export async function deletePaymentScreenshot(
  publicId: string,
): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(
      `Cloudinary deletion failed for ${publicId}: ${result.result}`,
    );
  }
}