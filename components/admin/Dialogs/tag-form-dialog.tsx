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
import { Plus } from "lucide-react";
import { createTag, updateTag } from "@/lib/db/actions/tag.action";
import { useRouter } from "next/navigation";
import type { Tag } from "@/lib/db/schema";

interface TagFormDialogProps {
  tag?: Tag;
  trigger?: React.ReactNode;
}

export default function TagFormDialog({ tag, trigger }: TagFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEdit = !!tag;

  const [formData, setFormData] = useState({
    name: "",
    color: "",
  });

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || "",
        color: tag.color || "",
      });
    } else {
      setFormData({
        name: "",
        color: "",
      });
    }
  }, [tag, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isEdit && tag) {
        result = await updateTag({ id: tag.id, ...formData });
      } else {
        result = await createTag(formData);
      }

      if (result.success) {
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save tag:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Tag
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tag" : "Create Tag"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the tag details."
              : "Add a new tag to organize promo codes."}
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
                placeholder="e.g., Sponsors"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || "#3b82f6"}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-14 h-9 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="e.g., #3b82f6"
                  className="flex-1 font-mono"
                />
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
              {loading ? "Saving..." : isEdit ? "Update Tag" : "Create Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
