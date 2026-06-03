import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen relative items-center justify-center  bg-cover bg-center bg-no-repeat px-4 py-10">
      <section className=" min-w-full rounded-[10px]  px-4 py-10  sm:min-w-[520px] sm:px-8">
        {children}
      </section>
    </main>
  );
};

export default AuthLayout;
