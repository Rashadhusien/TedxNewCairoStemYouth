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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCoupon, updateCoupon } from "@/lib/db/actions/coupon.action";
import { getActionErrorMessage } from "@/types/actions";
import { egpToPiastres } from "@/lib/pricing";
import type { Coupon } from "@/lib/db/schema";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["fixed", "percentage"]),
  discountEgp: z.number().min(0),
  percentageOff: z.number().min(0).max(100),
  maxUses: z.number().nullable().optional(),
  maxUsesPerUser: z.number().positive(),
  minOrderEgp: z.number().min(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CouponFormDialogProps {
  coupon?: Coupon | null;
}

export default function CouponFormDialog({ coupon }: CouponFormDialogProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      type: "fixed",
      discountEgp: 0,
      percentageOff: 0,
      maxUsesPerUser: 1,
      minOrderEgp: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        description: coupon.description ?? "",
        type: coupon.type,
        discountEgp: coupon.discountAmount / 100,
        percentageOff: coupon.percentageOff,
        maxUses: coupon.maxUses,
        maxUsesPerUser: coupon.maxUsesPerUser,
        minOrderEgp: coupon.minOrderAmount / 100,
        isActive: coupon.isActive,
      });
    } else {
      form.reset();
    }
  }, [coupon, form]);

  const couponType = form.watch("type");

  const onSubmit = async (data: FormValues) => {
    const payload = {
      code: data.code,
      description: data.description,
      type: data.type,
      discountAmount:
        data.type === "fixed" ? egpToPiastres(data.discountEgp ?? 0) : 0,
      percentageOff: data.type === "percentage" ? data.percentageOff : 0,
      maxUses: data.maxUses ?? null,
      maxUsesPerUser: data.maxUsesPerUser,
      minOrderAmount: egpToPiastres(data.minOrderEgp),
      isActive: data.isActive,
    };

    const result = coupon
      ? await updateCoupon({ id: coupon.id, ...payload })
      : await createCoupon(payload);

    if (!result.success) {
      toast.error(getActionErrorMessage(result, "Failed to save coupon"));
      return;
    }

    toast.success(coupon ? "Coupon updated" : "Coupon created");

    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {coupon ? (
          <Button variant="outline">Edit</Button>
        ) : (
          <Button size={"lg"}>
            <Plus className="mr-2 size-4" /> Create
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Code</FieldLabel>
                  <Input
                    {...field}
                    placeholder="SUMMER20"
                    className="uppercase"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                      <SelectItem value="fixed">Fixed Amount (EGP)</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {couponType === "fixed" ? (
              <Controller
                name="discountEgp"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Discount (EGP)</FieldLabel>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ) : (
              <Controller
                name="percentageOff"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Percentage Off (%)</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <Controller
              name="maxUses"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Max Uses (blank = unlimited)</FieldLabel>
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
              "Save Coupon"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
