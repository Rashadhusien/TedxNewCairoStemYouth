import type { Session } from "next-auth";
import Link from "next/link";
import Image from "next/image";

import { UserDropdown } from "@/components/UserDropdwon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";

import NavLinks from "./NavLinks";
import { Menu, Ticket } from "lucide-react";

const MobileNavigation = async ({ session }: { session: Session | null }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="lg:hidden rounded-lg cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[260px] p-0 border-r border-border/40 bg-background flex flex-col"
      >
        <SheetHeader className="px-4 pt-5 pb-4 border-b border-border/30">
          <SheetTitle asChild>
            <Link href={ROUTES.HOME} className="flex items-center gap-1.5">
              <Image
                src={"/logo.png"}
                alt="web-logo"
                width={100}
                height={100}
                className="w-auto h-auto"
              />
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-2 py-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-3 mb-2">
            Menu
          </p>
          <SheetClose asChild>
            <div className="flex flex-col gap-0.5">
              <NavLinks isMobileNav />
            </div>
          </SheetClose>
        </div>

        <div className="px-3 pb-6 pt-3 border-t border-border/30 flex flex-col gap-2">
          {/* Prominent Ticket CTA */}
          <SheetClose asChild>
            <Link href={ROUTES.TICKETS} className="w-full">
              <Button className="w-full rounded-lg h-10 text-sm font-semibold bg-primary text-primary-foreground">
                <Ticket className="size-4 mr-2" />
                Get Tickets
              </Button>
            </Link>
          </SheetClose>

          {session?.user ? (
            <UserDropdown session={session} isMobile />
          ) : (
            <>
              <SheetClose asChild>
                <Link href={ROUTES.LOGIN} className="w-full">
                  <Button className="w-full rounded-lg h-9 text-sm">
                    Log in
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href={ROUTES.REGISTER} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full rounded-lg h-9 text-sm border-border/50"
                  >
                    Sign up
                  </Button>
                </Link>
              </SheetClose>
            </>
          )}
          <SheetClose asChild>
            <Link href={ROUTES.SPONSORS} className="w-full">
              <Button className="w-full rounded-lg h-9 text-sm">
                Partner With Us
              </Button>
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
