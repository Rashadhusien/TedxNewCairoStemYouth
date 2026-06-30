"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateUserActiveStatus } from "@/lib/db/actions/user.action";
import { getActionErrorMessage } from "@/types/actions";

interface UserStatusButtonProps {
  userId: string;
  isActive: boolean;
}

export function UserStatusButton({
  userId,
  isActive,
}: UserStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextIsActive = !isActive;
  const label = nextIsActive ? "Activate" : "Deactivate";

  return (
    <Button
      type="button"
      variant={nextIsActive ? "outline" : "destructive"}
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await updateUserActiveStatus({
            userId,
            isActive: nextIsActive,
          });

          if (!result.success) {
            toast.error(
              getActionErrorMessage(result, `Failed to ${label.toLowerCase()} user`),
            );
            return;
          }

          toast.success(
            nextIsActive ? "User activated successfully" : "User deactivated successfully",
          );
          router.refresh();
        })
      }
    >
      {isPending ? "Saving..." : label}
    </Button>
  );
}
