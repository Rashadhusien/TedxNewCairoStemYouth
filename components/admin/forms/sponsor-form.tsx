"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
import { getActionErrorMessage } from "@/types/actions";

import type { Sponsor } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { SPONSOR_TYPES } from "@/constants/select";
import ImageUploadWidget from "@/components/upload-widget";
import { UploadWidgetValue } from "@/types";
import { useFieldArray } from "react-hook-form";
import { createSponsor, updateSponsor } from "@/lib/db/actions/sponsor.action";
import { sponsorFormSchema } from "@/lib/validation";
import { ROUTES } from "@/constants/routes";

type FormValues = z.infer<typeof sponsorFormSchema>;

interface SponsorFormProps {
  sponsor?: Sponsor | null;
}

export default function SponsorForm({ sponsor }: SponsorFormProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      website: "",
      tier: "inkind",
      leadGenQuestions: [],

      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "leadGenQuestions",
  });

  useEffect(() => {
    console.log(sponsor?.tier);
    if (sponsor) {
      form.reset({
        name: sponsor.name,
        description: sponsor.description ?? "",
        tier: sponsor.tier,
        logoUrl: sponsor.logoUrl ?? "",
        website: sponsor.website ?? "",
        leadGenQuestions: sponsor.leadGenQuestions ?? [],
        isActive: sponsor.isActive,
      });
    } else {
      form.reset();
    }
  }, [sponsor, form]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      description: data.description || "",
      website: data.website || "",
      tier: data.tier,
      leadGenQuestions: data.leadGenQuestions,
      logoUrl: data.logoUrl || "",
      isActive: data.isActive,
    };

    console.log("payload: ", payload);

    const result = sponsor
      ? await updateSponsor({ id: sponsor.id, ...payload })
      : await createSponsor(payload);

    if (!result.success) {
      toast.error(getActionErrorMessage(result, "Failed to save sponsor"));
      return;
    }

    toast.success(sponsor ? "Sponsor updated" : "Sponsor created");
    router.push(ROUTES.ADMIN.SPONSORS.HOME);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 max-w-2xl w-full mx-auto"
    >
      <FieldGroup className="flex flex-col sm:flex-row">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Name <span className="text-orange-600">*</span>
              </FieldLabel>
              <Input {...field} placeholder="Sponsor Name" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="website"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Website</FieldLabel>
              <Input {...field} placeholder="https://example.com" />
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
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea {...field} rows={2} placeholder="Sponsor Description" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="tier"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>
                Tier <span className="text-orange-600">*</span>
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {SPONSOR_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="logoUrl"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>
                Logo URL <span className="text-orange-600">*</span>
              </FieldLabel>
              <ImageUploadWidget
                value={
                  field.value
                    ? {
                        url: field.value,
                        publicId: logoUrl ?? "",
                      }
                    : null
                }
                onChange={(file: UploadWidgetValue | null) => {
                  if (file) {
                    field.onChange(file.url);
                    setLogoUrl(file.publicId);
                    // form.setValue("logoUrl", file.publicId, {
                    //   shouldValidate: true,
                    //   shouldDirty: true,
                    // });
                    setLogoUrl(file.publicId);
                  } else {
                    field.onChange("");
                    // form.setValue("logoUrl", "", {
                    //   shouldValidate: true,
                    //   shouldDirty: true,
                    // });
                    setLogoUrl("");
                  }
                }}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}{" "}
            </Field>
          )}
        />

        <div className="border-t pt-6 flex justify-between items-center">
          <span className="text-lg font-semibold">
            Lead Generation Questions
          </span>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                question: "",
                type: "dropdown",
                options: [""],
                required: false,
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
        <div className="space-y-4">
          {fields.map((question, index) => (
            <div
              key={question.id}
              className="border relative rounded-lg p-4 space-y-4"
            >
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                className="absolute top-1 right-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {/* Question Text */}

              <Controller
                control={form.control}
                name={`leadGenQuestions.${index}.question`}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Question</FieldLabel>
                    <Input {...field} placeholder="What is your job title?" />
                  </Field>
                )}
              />

              {/* Question Type */}
              <Controller
                control={form.control}
                name={`leadGenQuestions.${index}.type`}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Type</FieldLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="dropdown">Dropdown</SelectItem>

                        <SelectItem value="radio">Radio</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {/* Required */}
              <Controller
                control={form.control}
                name={`leadGenQuestions.${index}.required`}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FieldLabel>Required</FieldLabel>
                  </Field>
                )}
              />

              <OptionsEditor form={form} questionIndex={index} />
            </div>
          ))}
        </div>

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
        ) : sponsor ? (
          "Update Sponsor"
        ) : (
          "Create Sponsor"
        )}
      </Button>
    </form>
  );
}

function OptionsEditor({
  form,
  questionIndex,
}: {
  form: any;
  questionIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `leadGenQuestions.${questionIndex}.options`,
  });

  return (
    <div className="space-y-2">
      <FieldLabel>Options</FieldLabel>

      {fields.map((option, optionIndex) => (
        <div key={option.id} className="flex gap-2">
          <Controller
            control={form.control}
            name={`leadGenQuestions.${questionIndex}.options.${optionIndex}`}
            render={({ field }) => (
              <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
            )}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => remove(optionIndex)}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={() => append("")}>
        Add Option
      </Button>
    </div>
  );
}
