"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { SheetClose } from "@/components/ui/sheet";
import { adminLinks, mainLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NavLinks = ({
  isMobileNav = false,
  isAdmin = false,
}: {
  isMobileNav?: boolean;
  isAdmin?: boolean;
}) => {
  const pathname = usePathname();
  const links = mainLinks; //isAdmin ? adminLinks :

  return (
    <>
      {links.map((item) => {
        const isActive =
          (pathname.includes(item.route) && item.route.length > 1) ||
          pathname === item.route;

        const LinkComponent = (
          <Link
            href={item.route}
            className={cn(
              "flex items-center gap-2.5 transition-all duration-150",
              // Desktop pill style
              !isMobileNav &&
                cn(
                  "text-[13px] font-medium border-b-2 mx-4 py-1.5 ",
                  isActive
                    ? " border-primary"
                    : "text-muted-foreground hover:text-foreground  border-transparent hover:border-primary",
                ),
              // Mobile nav style
              isMobileNav &&
                cn(
                  "text-[13px] font-medium px-3 py-2 rounded-lg",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                ),
            )}
          >
            <span>{item.label}</span>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose asChild key={item.route}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <React.Fragment key={item.route}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
