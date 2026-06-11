"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createOffer, updateOffer } from "@/lib/db/actions/offer.action";
import { getActionErrorMessage } from "@/types/actions";
import {
  egpToPiastres,
  PurchasableTicketType,
  TICKET_TIERS,
} from "@/lib/pricing";
import type { Offer } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { OFFER_TYPES } from "@/constants/select";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["early_bird", "group", "bundle", "promotional"]),
  discountedPriceEgp: z.number().min(0).nullable().optional(),
  originalPriceEgp: z.number().min(0).nullable().optional(),
  remainingSlots: z.number().nullable().optional(),
  applicableTicketTypes: z.array(z.enum(["vip", "ip", "np"])),

  badgeLabel: z.string().optional(),
  displayOrder: z.number().min(0),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface OfferFormDialogProps {
  offer?: Offer | null;
}

export default function OfferFormDialog({ offer }: OfferFormDialogProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "promotional",
      displayOrder: 0,
      applicableTicketTypes: ["np"],
      isFeatured: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (offer) {
      form.reset({
        title: offer.title,
        description: offer.description ?? "",
        type: offer.type,
        discountedPriceEgp: offer.discountedPrice
          ? offer.discountedPrice / 100
          : null,
        originalPriceEgp: offer.originalPrice
          ? offer.originalPrice / 100
          : null,
        remainingSlots: offer.remainingSlots,
        badgeLabel: offer.badgeLabel ?? "",
        displayOrder: offer.displayOrder,
        applicableTicketTypes:
          offer.applicableTicketTypes as unknown as PurchasableTicketType[],
        isFeatured: offer.isFeatured,
        isActive: offer.isActive,
      });
    } else {
      form.reset();
    }
  }, [offer, form]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      title: data.title,
      description: data.description,
      type: data.type,
      discountedPrice:
        data.discountedPriceEgp != null
          ? egpToPiastres(data.discountedPriceEgp)
          : null,
      originalPrice:
        data.originalPriceEgp != null
          ? egpToPiastres(data.originalPriceEgp)
          : null,
      remainingSlots: data.remainingSlots ?? null,
      badgeLabel: data.badgeLabel,
      displayOrder: data.displayOrder,
      applicableTicketTypes:
        data.applicableTicketTypes as PurchasableTicketType[],

      isFeatured: data.isFeatured,
      isActive: data.isActive,
    };

    const result = offer
      ? await updateOffer({ id: offer.id, ...payload })
      : await createOffer(payload);

    if (!result.success) {
      toast.error(getActionErrorMessage(result, "Failed to save offer"));
      return;
    }

    toast.success(offer ? "Offer updated" : "Offer created");
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {offer ? (
          <Button variant="outline">Edit</Button>
        ) : (
          <Button size={"lg"}>
            <Plus className="size-4" /> Create Offer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offer ? "Edit Offer" : "Create Offer"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Title</FieldLabel>
                  <Input {...field} placeholder="Early Bird — Save 100 EGP" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...field} rows={2} />
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OFFER_TYPES.map((offerType) => (
                        <SelectItem
                          key={offerType.value}
                          value={offerType.value}
                        >
                          {offerType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="applicableTicketTypes"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Type (applicable to)</FieldLabel>
                  <Select
                    value={field.value?.join(",") ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value.split(",") as PurchasableTicketType[],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TICKET_TIERS).map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="discountedPriceEgp"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Discounted Price (EGP, optional)</FieldLabel>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name="originalPriceEgp"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Original Price (EGP, optional)</FieldLabel>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name="badgeLabel"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Badge Label</FieldLabel>
                  <Input {...field} placeholder="Only 20 left!" />
                </Field>
              )}
            />

            <Controller
              name="isFeatured"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel>Featured on homepage</FieldLabel>
                </Field>
              )}
            />

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
            ) : (
              "Save Offer"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
