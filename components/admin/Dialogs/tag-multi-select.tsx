"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { listTags } from "@/lib/db/actions/tag.action";

interface TagMultiSelectProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagMultiSelect({
  value,
  onChange,
}: TagMultiSelectProps) {
  const [tags, setTags] = useState<
    { id: string; name: string; color: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listTags()
      .then((result) => {
        if (!mounted) return;
        setTags(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const toggle = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  return (
    <div className="flex flex-col max-h-20 overflow-y-auto gap-2">
      {loading && (
        <p className="text-sm text-muted-foreground">Loading tags...</p>
      )}
      {!loading && tags.length === 0 && (
        <p className="text-sm text-muted-foreground">No tags yet.</p>
      )}
      {tags.map((tag) => (
        <div key={tag.id} className="flex items-center gap-2">
          <Checkbox
            id={`tag-${tag.id}`}
            checked={value.includes(tag.id)}
            onCheckedChange={() => toggle(tag.id)}
          />
          <Label
            htmlFor={`tag-${tag.id}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: tag.color || "#3b82f6" }}
            />
            {tag.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
