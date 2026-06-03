import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        403
      </p>
      <h1 className="mt-2 font-syne text-3xl font-bold">Access denied</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        You don&apos;t have permission to view this page. If you think this is a
        mistake, sign in with a different account or contact support.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href={ROUTES.HOME}>Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.LOGIN}>Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
