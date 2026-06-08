import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen  p-4 ">
      <section className=" min-w-full flex-center  rounded-[10px] flex-1  px-4 py-10  sm:min-w-[520px] sm:px-8">
        {children}
      </section>
      {/* <section className="flex-1 bg-muted/50 rounded-2xl hidden lg:flex flex-col justify-between">
        <div className="p-4">
          <Image
            src="/logo.png"
            alt="TEDxNewCairoSTEMYouth Logo"
            width={140}
            height={140}
            className="w-auto h-auto brightness-95 "
          />{" "}
          <h2 className="text-xl font-bold mt-4 pl-3">
            Welcome to TEDxNewCairoSTEMYouth
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 pl-3">
            independently, TEDx event , Platform
          </p>
        </div>
        <div className="flex  items-center">
          <div className="p-4 flex-1">
            <h2 className="text-xl font-bold mt-4 pl-3">Ready to launch?</h2>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 pl-3">
              Clone the repo, install dependencies, and your dashboard is live
              in minutes.
            </p>
          </div>
          <div className="w-px h-full bg-muted/50" />
          <div className="p-4 flex-1">
            <h2 className="text-xl font-bold mt-4 pl-3">Ready to launch?</h2>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 pl-3">
              Clone the repo, install dependencies, and your dashboard is live
              in minutes.
            </p>
          </div>
        </div>
      </section> */}
    </main>
  );
};

export default AuthLayout;
