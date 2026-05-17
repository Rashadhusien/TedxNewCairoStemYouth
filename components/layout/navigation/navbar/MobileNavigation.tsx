import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavLinks from "./NavLinks";
import { ROUTES } from "@/constants/routes";
import Image from "next/image";

const MobileNavigation = async () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="lg:hidden rounded-lg  cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[260px] p-0 border-r border-border/40 bg-background flex flex-col"
      >
        <SheetHeader className="px-4 pt-5 pb-4 border-b border-border/30">
          <SheetTitle asChild>
            <Link href="/" className="flex items-center gap-1.5">
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

        {/* Nav links */}
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

        {/* Footer */}
        <div className="px-3 pb-6 pt-3 border-t border-border/30 flex flex-col gap-2">
          {/* <SheetClose asChild>
            <Link href={ROUTES.LOGIN} className="w-full">
              <Button className="w-full rounded-lg h-9 text-sm">Log in</Button>
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
          </SheetClose> */}
          <SheetClose asChild>
            <Link href={ROUTES.SPONSERS} className="w-full">
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
