import Image from "next/image";
import React from "react";
import NavLinks from "./NavLinks";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import MobileNavigation from "./MobileNavigation";

const Navbar = () => {
  return (
    <nav className="relative container mx-auto bg-transparent ">
      <div className="absolute  py-4 flex-between w-full z-20">
        <Image
          src={"/logo.png"}
          alt="web-logo"
          width={100}
          height={100}
          className="w-auto h-auto"
        />

        <div className="hidden lg:flex items-center gap-1">
          <div className="flex items-center gap-0.5 ">
            <NavLinks />
          </div>

          <div className="flex items-center gap-2 ">
            <Link href={ROUTES.SPONSERS}>
              <Button size="sm" className=" px-5 h-8 text-sm">
                Partner with us
              </Button>
            </Link>
          </div>
        </div>

        <div className="block lg:hidden">
          <MobileNavigation />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
