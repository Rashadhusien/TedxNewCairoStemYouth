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
import { Plus, Edit } from "lucide-react";
import { createPackage, updatePackage } from "@/lib/db/actions/package.action";
import { useRouter } from "next/navigation";
import type { Package } from "@/lib/db/schema";

interface PackageFormDialogProps {
  package?: Package;
  trigger?: React.ReactNode;
}

export default function PackageFormDialog({
  package: pkg,
  trigger,
}: PackageFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEdit = !!pkg;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ticketCount: 1,
    pricePerTicketPiastres: 38000,
    requiresAccessCode: false,
    isPromoApplicable: false,
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        ticketCount: pkg.ticketCount || 1,
        pricePerTicketPiastres: pkg.pricePerTicketPiastres || 38000,
        requiresAccessCode: pkg.requiresAccessCode || false,
        isPromoApplicable: pkg.isPromoApplicable || false,
        displayOrder: pkg.displayOrder || 0,
        isActive: pkg.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        ticketCount: 1,
        pricePerTicketPiastres: 38000,
        requiresAccessCode: false,
        isPromoApplicable: false,
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [pkg, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isEdit && pkg) {
        result = await updatePackage({ id: pkg.id, ...formData });
      } else {
        result = await createPackage(formData);
      }
      if (result.success) {
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save package:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Package
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Package" : "Create Package"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the ticket package details."
              : "Add a new ticket package to the system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Regular, 3 Friends, 5 Friends"
                required
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
                placeholder="Package description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ticketCount">Ticket Count</Label>
                <Input
                  id="ticketCount"
                  type="number"
                  min="1"
                  value={formData.ticketCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ticketCount: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricePerTicketPiastres">
                  Price per Ticket (piastres)
                </Label>
                <Input
                  id="pricePerTicketPiastres"
                  type="number"
                  min="100"
                  value={formData.pricePerTicketPiastres}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerTicketPiastres: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresAccessCode"
                checked={formData.requiresAccessCode}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    requiresAccessCode: checked as boolean,
                  })
                }
              />
              <Label htmlFor="requiresAccessCode">Requires Access Code</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isPromoApplicable"
                checked={formData.isPromoApplicable}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isPromoApplicable: checked as boolean,
                  })
                }
              />
              <Label htmlFor="isPromoApplicable">Promo Codes Applicable</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
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
                  ? "Update Package"
                  : "Create Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
