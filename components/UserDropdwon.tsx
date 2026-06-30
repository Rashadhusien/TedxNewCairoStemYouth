"use client";
import type { Session } from "next-auth";
import {
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  TicketIcon,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import { ROUTES } from "@/constants/routes";
import { signOutAction } from "@/lib/db/actions/auth.action";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { UserIcon } from "@animateicons/react/lucide";

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
  const user = session.user;
  const displayName = getDisplayName(session);

  console.log(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            " bg-transparent hover:bg-accent/50 transition-colors h-10 px-3 gap-2",
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
        {" "}
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || "user name"}
              />
              <AvatarFallback className="rounded-full">
                {getInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <Separator />
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
              href={ROUTES.PROFILE}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Profile</span>
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link
              href={ROUTES.MY_TICKET}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
            >
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">My Ticket</span>
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={() =>
              signOut({
                callbackUrl: ROUTES.LOGIN,
              })
            }
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10! hover:text-destructive-foreground  transition-colors "
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
