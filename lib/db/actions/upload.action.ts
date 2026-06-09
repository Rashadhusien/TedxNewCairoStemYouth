"use server";

import { auth } from "@/auth";
import { generatePaymentUploadSignature } from "@/lib/cloudinary";
import type { CloudinarySignaturePayload } from "@/lib/cloudinary";

export interface PaymentUploadConfig {
  cloudName: string;
  uploadPreset: string;
  uploadUrl: string;
  folder: string;
}

function getCloudinaryCloudName(): string {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim();

  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  return cloudName;
}

function getCloudinaryUploadPreset(): string {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!uploadPreset) {
    throw new Error("Cloudinary upload preset is not configured");
  }

  return uploadPreset;
}

/** Unsigned upload config — uses the Cloudinary upload preset (recommended). */
export async function getPaymentUploadConfig(): Promise<PaymentUploadConfig> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  const cloudName = getCloudinaryCloudName();
  const uploadPreset = getCloudinaryUploadPreset();
  const uploadUrl =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL?.trim() ||
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return {
    cloudName,
    uploadPreset,
    uploadUrl,
    folder: `tedx/payment_screenshots/${session.user.id}`,
  };
}

/** Signed upload signature — requires API key create permissions on Cloudinary. */
export async function getPaymentUploadSignature(): Promise<CloudinarySignaturePayload> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  return generatePaymentUploadSignature(session.user.id);
}
