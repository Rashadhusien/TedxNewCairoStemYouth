import { Suspense } from "react";

import VerifyEmailForm from "@/components/main/forms/verify-email-form";

function VerifyEmailPage() {
  return <VerifyEmailForm />;
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPage />
    </Suspense>
  );
}
