"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getActionErrorMessage } from "@/types/actions";
import { useRouter } from "next/navigation";
import ImageUploadWidget from "@/components/upload-widget";
import { UploadWidgetValue } from "@/types";
import { createSpeaker, updateSpeaker } from "@/lib/db/actions/speaker.action";
import { speakerFormSchema } from "@/lib/validation";
import { ROUTES } from "@/constants/routes";
import type { Speaker } from "@/lib/db/schema";

type FormValues = z.infer<typeof speakerFormSchema>;

interface SpeakerFormProps {
  speaker?: Speaker | null;
}

export default function SpeakerForm({ speaker }: SpeakerFormProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(speakerFormSchema),
    defaultValues: {
      name: "",
      role: "",
      description: "",
      tagline: "",
      type: "main",
      symbol: "",
      initials: "",
      accent: "",
      roleColor: "",
      imageUrl: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const speakerType = form.watch("type");

  useEffect(() => {
    if (speaker) {
      form.reset({
        name: speaker.name,
        role: speaker.role,
        description: speaker.description,
        tagline: speaker.tagline,
        type: speaker.type,
        symbol: speaker.symbol || "",
        initials: speaker.initials || "",
        accent: speaker.accent || "",
        roleColor: speaker.roleColor || "",
        imageUrl: speaker.imageUrl,
        displayOrder: speaker.displayOrder,
        isActive: speaker.isActive,
      });
      setImageUrl(speaker.imageUrl);
    } else {
      form.reset();
    }
  }, [speaker, form]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      role: data.role,
      description: data.description,
      tagline: data.tagline,
      type: data.type,
      symbol: data.symbol,
      initials: data.initials,
      accent: data.accent,
      roleColor: data.roleColor,
      imageUrl: data.imageUrl,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    };

    const result = speaker
      ? await updateSpeaker({ id: speaker.id, ...payload })
      : await createSpeaker(payload);

    if (!result.success) {
      toast.error(getActionErrorMessage(result, "Failed to save speaker"));
      return;
    }

    toast.success(speaker ? "Speaker updated" : "Speaker created");
    router.push(ROUTES.ADMIN.SPEAKERS.HOME);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 max-w-2xl w-full mx-auto"
    >
      <FieldGroup>
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Speaker Type <span className="text-orange-600">*</span>
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Speaker</SelectItem>
                  <SelectItem value="keyholder">Keyholder</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Name <span className="text-orange-600">*</span>
              </FieldLabel>
              <Input {...field} placeholder="Speaker Name" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Role <span className="text-orange-600">*</span>
              </FieldLabel>
              <Input {...field} placeholder="e.g. The Fire" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Description <span className="text-orange-600">*</span>
              </FieldLabel>
              <Textarea
                {...field}
                rows={2}
                placeholder="Brief description of the speaker"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="tagline"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Tagline <span className="text-orange-600">*</span>
              </FieldLabel>
              <Textarea
                {...field}
                rows={2}
                placeholder="Inspirational tagline"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {speakerType === "main" && (
        <FieldGroup>
          <Controller
            name="symbol"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Symbol (Emoji) <span className="text-orange-600">*</span>
                </FieldLabel>
                <Input {...field} placeholder="🔥" maxLength={10} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="accent"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Accent Gradient <span className="text-orange-600">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="from-[#e60000] to-[#ff6b00]"
                  maxLength={100}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="roleColor"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Role Color <span className="text-orange-600">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="text-[#e66030]/70 group-hover:text-[#e66030]"
                  maxLength={100}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      )}

      {speakerType === "keyholder" && (
        <FieldGroup>
          <Controller
            name="initials"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Initials <span className="text-orange-600">*</span>
                </FieldLabel>
                <Input {...field} placeholder="MA" maxLength={10} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      )}

      <FieldGroup>
        <Controller
          control={form.control}
          name="imageUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Image URL <span className="text-orange-600">*</span>
              </FieldLabel>
              <ImageUploadWidget
                value={
                  field.value
                    ? {
                        url: field.value,
                        publicId: imageUrl ?? "",
                      }
                    : null
                }
                onChange={(file: UploadWidgetValue | null) => {
                  if (file) {
                    field.onChange(file.url);
                    setImageUrl(file.publicId);
                  } else {
                    field.onChange("");
                    setImageUrl("");
                  }
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="displayOrder"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Display Order</FieldLabel>
              <Input
                {...field}
                type="number"
                placeholder="0"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel>Active</FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : speaker ? (
          "Update Speaker"
        ) : (
          "Create Speaker"
        )}
      </Button>
    </form>
  );
}
