// ── Divider component (optional, inline in your form files) ─────────────────
// components/auth/auth-divider.tsx

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ── In UserLoginForm — add AFTER the CardContent closing tag, BEFORE CardFooter
// ─────────────────────────────────────────────────────────────────────────────
//
//  </CardContent>
//
//  <div className="px-6 pb-2">          <-- same horizontal padding as CardContent
//    <AuthDivider />
//    <GoogleSignInButton className="w-full" />
//  </div>
//
//  <CardFooter>
//    ...existing submit button...
//  </CardFooter>
//
// ── In UserRegisterForm — same placement ─────────────────────────────────────
//
//  </CardContent>
//
//  <div className="px-6 pb-2">
//    <AuthDivider />
//    <GoogleSignInButton label="Register with Google" className="w-full" />
//  </div>
//
//  <CardFooter>
//    ...existing submit button...
//  </CardFooter>
//
// ── Imports to add at the top of both form files ─────────────────────────────
//
//  import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
//  import { AuthDivider } from "@/components/auth/auth-divider";
