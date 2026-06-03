"use client";
import type { Session } from "next-auth";
import {
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import { ROUTES } from "@/constants/routes";
import { signOutAction } from "@/lib/db/actions/auth.action";
import { cn } from "@/lib/utils";

function getDisplayName(session: Session) {
  return session.user.name ?? session.user.email?.split("@")[0] ?? "Account";
}

export function UserDropdown({
  session,
  isMobile = false,
}: {
  session: Session;
  isMobile?: boolean;
}) {
  const role = session.user.role;
  const displayName = getDisplayName(session);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full bg-transparent hover:bg-accent/50 transition-colors h-10 px-3 gap-2",
            isMobile && "h-12 px-4 gap-3 w-full justify-start",
          )}
        >
          <UserAvatar
            id={session.user.id}
            name={displayName}
            imageUrl={session.user.image}
            linkToProfile={false}
            className={isMobile ? "h-8 w-8" : "h-7 w-7"}
          />
          <span
            className={cn(
              "text-sm font-medium truncate",
              isMobile ? "flex-1 text-left" : "max-w-28",
            )}
          >
            {displayName}
          </span>
          {isMobile ? (
            <ChevronRightIcon className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-48 min-w-0", isMobile && "w-56")}
      >
        <DropdownMenuGroup className="p-1">
          {role === "admin" && (
            <DropdownMenuItem asChild>
              <Link
                href={"/admin"}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
            >
              <BadgeCheckIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={() =>
            signOut({
              callbackUrl: ROUTES.LOGIN,
            })
          }
        >
          <LogOutIcon className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
