import Image from "next/image";
import Link from "next/link";

import { UserDropdown } from "@/components/UserDropdwon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { auth } from "@/auth";

import MobileNavigation from "./MobileNavigation";
import NavLinks from "./NavLinks";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="relative container mx-auto bg-transparent ">
      <div className="absolute  py-4 flex-between w-full z-20">
        <Link href={ROUTES.HOME} className="cursor-pointer">
          <Image
            src={"/logo.png"}
            alt="web-logo"
            width={100}
            height={100}
            className="w-auto h-auto"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <div className="flex items-center gap-0.5 ">
            <NavLinks />
          </div>

          <div className="flex items-center gap-2 ">
            {session?.user ? (
              <UserDropdown session={session} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href={ROUTES.LOGIN}>
                  <Button size="sm" className="rounded-full px-5 h-8 text-sm">
                    Log in
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-5 h-8 text-sm"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="block lg:hidden">
          <MobileNavigation session={session} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
