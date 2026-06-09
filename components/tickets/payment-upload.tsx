"use client";

import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/constants";
import { getPaymentUploadConfig } from "@/lib/db/actions/upload.action";
import type { UploadWidgetValue } from "@/types";

interface PaymentUploadProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
}

function getUploadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Failed to upload image. Please try again.";
}

export default function PaymentUpload({
  value = null,
  onChange,
  disabled,
}: PaymentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WebP image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File must be smaller than 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const config = await getPaymentUploadConfig();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", config.uploadPreset);
      formData.append("folder", config.folder);
      formData.append("tags", "payment_proof");

      const response = await fetch(config.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const cloudinaryMessage =
          result?.error?.message ?? `Upload failed (${response.status})`;
        throw new Error(cloudinaryMessage);
      }

      if (!result?.secure_url || !result?.public_id) {
        throw new Error("Upload succeeded but Cloudinary returned an invalid response");
      }

      const payload: UploadWidgetValue = {
        url: result.secure_url,
        publicId: result.public_id,
        sizeBytes: result.bytes,
        mimeType: `image/${result.format}`,
      };

      setPreview(payload);
      onChange?.(payload);
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      setError(getUploadErrorMessage(uploadError));
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (preview) {
    return (
      <div className="space-y-2">
        <div className="relative group">
          <Image
            src={preview.url}
            alt="Payment proof preview"
            width={400}
            height={160}
            className="w-full h-40 object-cover rounded-lg border border-white/10"
          />
          {!disabled && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Payment screenshot uploaded
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled && !uploading) {
            inputRef.current?.click();
          }
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/2 p-8 cursor-pointer hover:border-primary/40 hover:bg-white/4 transition-colors"
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        ) : (
          <UploadCloud className="w-8 h-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {uploading ? "Uploading..." : "Click to upload payment screenshot"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WebP up to 5MB
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
