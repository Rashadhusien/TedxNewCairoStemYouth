"use client";
import { MAX_FILE_SIZE } from "@/constants";
import { UploadWidgetValue } from "@/types";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";

interface ImageUploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue) => void;
  disabled?: boolean;
}

interface CloudinaryWidgetOptions {
  cloudName: string | undefined;
  uploadPreset: string | undefined;
  multiple: boolean;
  folder: string;
  maxFileSize: number;
  clientAllowedFormats: string[];
}

interface CloudinaryWidgetResult {
  event: string;
  info: {
    secure_url: string;
    public_id: string;
    bytes: number;
    format: string;
    resource_type: string;
  };
}

interface CloudinaryWidget {
  open: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: CloudinaryWidgetOptions,
        callback: (
          error: string | null,
          result: CloudinaryWidgetResult,
        ) => void,
      ) => CloudinaryWidget;
    };
  }
}

const ImageUploadWidget = ({
  value = null,
  onChange,
  disabled,
}: ImageUploadWidgetProps) => {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const onChangeRef = useRef(onChange);
  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeWidget = () => {
      if (!window.cloudinary || widgetRef.current) return false;

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          multiple: false,
          folder: "tedx",
          maxFileSize: MAX_FILE_SIZE,
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        },
        (error, result) => {
          if (!error && result.event === "success") {
            const payload: UploadWidgetValue = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
              sizeBytes: result.info.bytes,
              mimeType: `image/${result.info.format}`,
            };
            setPreview(payload);
            onChangeRef.current?.(payload);
          }
        },
      );
      return true;
    };

    if (initializeWidget()) return;

    const intervalId = window.setInterval(() => {
      if (initializeWidget()) {
        window.clearInterval(intervalId);
      }
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  const openWidget = () => {
    if (!disabled) {
      if (
        !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      ) {
        console.warn(
          "Cloudinary is not configured. Please set environment variables.",
        );
        return;
      }
      widgetRef.current?.open();
    }
  };

  const renderPreview = () => {
    if (!preview) return null;

    return (
      <div className="upload-preview">
        <div className="relative group">
          <CldImage
            src={preview.url}
            alt="Image preview"
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-lg border"
          />
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onChangeRef.current?.(null as unknown as UploadWidgetValue);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Image uploaded successfully
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {preview ? (
        renderPreview()
      ) : (
        <div
          className="upload-dropzone"
          role="button"
          tabIndex={0}
          onClick={openWidget}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              openWidget();
            }
          }}
        >
          <div className="upload-prompt">
            <UploadCloud className="icon" />
            <p>Click to upload image</p>
            <p>PNG, JPG, WebP up to 3MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWidget;
