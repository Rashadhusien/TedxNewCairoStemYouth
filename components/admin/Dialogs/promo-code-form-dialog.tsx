"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, AlertCircle } from "lucide-react";
import {
  createPromoCode,
  updatePromoCode,
} from "@/lib/db/actions/promo-code.action";
import { useRouter } from "next/navigation";
import type { PromoCode } from "@/lib/db/schema";
import TagMultiSelect from "./tag-multi-select";

interface PromoCodeWithTags extends PromoCode {
  tags?: { id: string; name: string; slug: string; color: string | null }[];
}

interface PromoCodeFormDialogProps {
  promoCode?: PromoCodeWithTags;
  trigger?: React.ReactNode;
}

export default function PromoCodeFormDialog({
  promoCode,
  trigger,
}: PromoCodeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = !!promoCode;

  const [formData, setFormData] = useState({
    code: "",
    owner: "",
    description: "",
    type: "discount" as "fixed_price" | "discount" | "free" | "free_vip",
    valuePiastres: 0,
    maxUses: null as number | null,
    validFrom: "",
    validUntil: "",
    isActive: true,
    tagIds: [] as string[],
  });

  useEffect(() => {
    if (promoCode) {
      setFormData({
        code: promoCode.code || "",
        owner: promoCode.owner || "",
        description: promoCode.description || "",
        type: promoCode.type || "discount",
        valuePiastres: promoCode.valuePiastres || 0,
        maxUses: promoCode.maxUses || null,
        validFrom: promoCode.validFrom
          ? new Date(promoCode.validFrom).toISOString().split("T")[0]
          : "",
        validUntil: promoCode.validUntil
          ? new Date(promoCode.validUntil).toISOString().split("T")[0]
          : "",
        isActive: promoCode.isActive ?? true,
        tagIds: promoCode.tags ? promoCode.tags.map((t) => t.id) : [],
      });
    } else {
      setFormData({
        code: "",
        owner: "",
        description: "",
        type: "discount",
        valuePiastres: 0,
        maxUses: null,
        validFrom: "",
        validUntil: "",
        isActive: true,
        tagIds: [],
      });
    }
  }, [promoCode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      const submitData = {
        ...formData,
        validFrom: formData.validFrom ? new Date(formData.validFrom) : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
      };

      if (isEdit && promoCode) {
        result = await updatePromoCode({ id: promoCode.id, ...submitData });
      } else {
        result = await createPromoCode(submitData);
      }

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        // Handle validation errors
        if (result.error) {
          const errorObj = result.error;
          if (typeof errorObj === "string") {
            setError(errorObj);
          } else if ("details" in errorObj && errorObj.details) {
            // Extract field-specific errors
            const fieldErrors = Object.values(errorObj.details).flat();
            setError(fieldErrors.join(", "));
          } else if ("message" in errorObj && errorObj.message) {
            setError(errorObj.message);
          } else {
            setError("Failed to save promo code");
          }
        } else {
          setError("Failed to save promo code");
        }
      }
    } catch (error) {
      console.error("Failed to save promo code:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Promo Code
    </Button>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) setError(null);
      }}
    >
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Promo Code" : "Create Promo Code"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the promotional code details."
              : "Add a new promotional code for ticket discounts."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., EARLYBIRD20"
                required
                disabled={isEdit}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner">Owner (optional)</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                placeholder="e.g., Sponsor Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Promo code description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_price">Fixed Price</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="free_vip">Free VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type !== "free" && formData.type !== "free_vip" && (
              <div className="grid gap-2">
                <Label htmlFor="valuePiastres">
                  {formData.type === "fixed_price"
                    ? "Fixed Price (piastres)"
                    : "Discount Amount (piastres)"}
                </Label>
                <Input
                  id="valuePiastres"
                  type="number"
                  min="0"
                  value={formData.valuePiastres}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valuePiastres: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="maxUses">Max Uses (optional)</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={formData.maxUses || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUses: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="validFrom">Valid From (optional)</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="validUntil">Valid Until (optional)</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <TagMultiSelect
                value={formData.tagIds}
                onChange={(tagIds) => setFormData({ ...formData, tagIds })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Promo Code"
                  : "Create Promo Code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
