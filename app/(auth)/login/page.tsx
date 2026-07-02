import { Suspense } from "react";

import UserLoginForm from "@/components/main/forms/user-login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={null} >
      <UserLoginForm />
    </Suspense>
  );
}
