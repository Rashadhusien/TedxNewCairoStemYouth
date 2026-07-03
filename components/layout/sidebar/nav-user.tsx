"use client";

import { ArrowLeft, EllipsisVertical, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/lib/db/actions/auth.action";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
                id={user?.id || ""}
                name={user?.name || ""}
                imageUrl={user?.image || undefined}
                linkToProfile={false}
                className={isMobile ? "h-8 w-8" : "h-7 w-7"}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name || ""}</span>
                <span className="truncate text-muted-foreground  text-xs">
                  {user?.email || ""}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar
                  id={user?.id || ""}
                  name={user?.name || ""}
                  imageUrl={user?.image || undefined}
                  linkToProfile={false}
                  className={isMobile ? "h-8 w-8" : "h-7 w-7"}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.name || ""}
                  </span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user?.email || ""}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={ROUTES.HOME}
                  prefetch={false}
                  className="cursor-pointer hover:bg-muted"
                >
                  <ArrowLeft />
                  <span>Back to Website</span>
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquareDot />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutAction}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
