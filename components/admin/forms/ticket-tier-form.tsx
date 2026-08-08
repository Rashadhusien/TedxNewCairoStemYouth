"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getActionErrorMessage } from "@/types/actions";

import type { TicketTier } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import {
  createTicketTier,
  updateTicketTier,
} from "@/lib/db/actions/ticket-tier.action";
import { ticketTierFormSchema } from "@/lib/validation";
import { ROUTES } from "@/constants/routes";

type FormValues = z.infer<typeof ticketTierFormSchema>;

interface TicketTierFormProps {
  ticketTier?: TicketTier | null;
}

export default function TicketTierForm({ ticketTier }: TicketTierFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(ticketTierFormSchema),
    defaultValues: {
      type: "general",
      label: "",
      subtitle: "",
      pricePiastres: 0,
      features: [""],
      displayOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (ticketTier) {
      form.reset({
        type: "general", // Force to general since we removed other types
        label: ticketTier.label,
        subtitle: ticketTier.subtitle,
        pricePiastres: ticketTier.pricePiastres,
        features: ticketTier.features,
        displayOrder: ticketTier.displayOrder,
        isActive: ticketTier.isActive,
      });
    } else {
      form.reset({
        type: "general",
        label: "",
        subtitle: "",
        pricePiastres: 0,
        features: [""],
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [ticketTier, form]);

  const currentFeatures = form.watch("features") || [];

  const addFeature = () => {
    form.setValue("features", [...currentFeatures, ""]);
  };

  const removeFeature = (index: number) => {
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index),
    );
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...currentFeatures];
    newFeatures[index] = value;
    form.setValue("features", newFeatures);
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      type: data.type,
      label: data.label,
      subtitle: data.subtitle,
      pricePiastres: data.pricePiastres,
      features: data.features,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    };

    const result = ticketTier
      ? await updateTicketTier({ id: ticketTier.id, ...payload })
      : await createTicketTier(payload);

    if (!result.success) {
      toast.error(getActionErrorMessage(result, "Failed to save ticket tier"));
      return;
    }

    toast.success(ticketTier ? "Ticket tier updated" : "Ticket tier created");
    router.push(ROUTES.ADMIN.TICKET_TIERS.HOME);
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
                Type <span className="text-orange-600">*</span>
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket tier type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="ip">IP (Industry Professional)</SelectItem>
                  <SelectItem value="np">NP (Normal Person)</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="label"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Label <span className="text-orange-600">*</span>
              </FieldLabel>
              <Input {...field} placeholder="VIP Seat" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="subtitle"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Subtitle <span className="text-orange-600">*</span>
              </FieldLabel>
              <Input {...field} placeholder="Very Important Person" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="pricePiastres"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Price (Piastres) <span className="text-orange-600">*</span>
              </FieldLabel>
              <Input
                {...field}
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="55000"
              />
              <p className="text-xs text-muted-foreground">
                Enter price in piastres (100 piastres = 1 EGP)
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="displayOrder"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Display Order</FieldLabel>
              <Input
                {...field}
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="border-t pt-6 flex justify-between items-center">
          <span className="text-lg font-semibold">Features</span>

          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        </div>

        <div className="space-y-4">
          {currentFeatures.map((feature, index) => (
            <div
              key={index}
              className="border relative rounded-lg p-4 space-y-4"
            >
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeFeature(index)}
                className="absolute top-2 right-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Controller
                control={form.control}
                name={`features.${index}`}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Feature {index + 1}</FieldLabel>
                    <Input
                      {...field}
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Front-row seating"
                    />
                  </Field>
                )}
              />
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
        ) : ticketTier ? (
          "Update Ticket Tier"
        ) : (
          "Create Ticket Tier"
        )}
      </Button>
    </form>
  );
}
