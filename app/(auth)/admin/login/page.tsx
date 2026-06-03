import { Suspense } from "react";

import { AdminLoginForm } from "@/app/admin/components/admin-login-form";

export const metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  return (
    <div className="flex-center">
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
