"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { egpToPiastres } from "@/lib/pricing";
import { bulkUpdatePromoCodePrice } from "@/lib/db/actions/promo-code.action";
import { getActionErrorMessage } from "@/types/actions";

interface BulkFixedPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onSuccess: () => void;
}

export default function BulkFixedPriceDialog({
  open,
  onOpenChange,
  ids,
  onSuccess,
}: BulkFixedPriceDialogProps) {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = price.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      setError("Enter a valid price with up to 2 decimal places");
      return;
    }

    const valuePiastres = egpToPiastres(Number(trimmed));
    if (valuePiastres <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await bulkUpdatePromoCodePrice({ ids, valuePiastres });

      if (result.success) {
        toast.success(
          `Updated ${ids.length} promo code${ids.length === 1 ? "" : "s"}`,
        );
        onOpenChange(false);
        onSuccess();
        router.refresh();
      } else {
        toast.error(
          getActionErrorMessage(result, "Failed to update promo codes"),
        );
      }
    } catch (err) {
      console.error("Failed to bulk update promo codes:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Change Fixed Price</DialogTitle>
          <DialogDescription>
            Selected Promo Codes: {ids.length}
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
              <Label htmlFor="newPrice">New Price (EGP)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="newPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 150"
                  required
                  autoFocus
                />
                <span className="text-sm font-medium text-muted-foreground">
                  EGP
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Updating..."
                : `Update ${ids.length} Promo Code${ids.length === 1 ? "" : "s"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}