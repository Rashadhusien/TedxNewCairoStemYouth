"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { getSafeCallbackUrl } from "@/lib/auth/route-guards";
import { signInWithCredentials } from "@/lib/db/actions/auth.action";
import { UserLoginFormSchema } from "@/lib/validation";
import { PasswordInput } from "@/components/ui/password-input";

function UserLoginFrom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(
    searchParams.get("callbackUrl"),
    ROUTES.HOME,
  );

  const form = useForm<z.infer<typeof UserLoginFormSchema>>({
    resolver: zodResolver(UserLoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof UserLoginFormSchema>) {
    const result = await signInWithCredentials(data);

    if (!result.success) {
      if (result.requiresVerification && result.email) {
        toast.error("Email not verified", {
          description: result.error.message,
        });
        router.push(
          `${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(result.email)}`,
        );
        return;
      }

      toast.error("Sign in failed", {
        description: result.error.message,
      });
      return;
    }

    toast.success("Welcome back", {
      description: "You are now signed in.",
    });
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle className="text-3xl text-center font-bold">
          Welcome back !
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground text-center mt-2">
          Enter your email and password to login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-user-login" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-user-login-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="form-user-login-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-user-login-password">
                    Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="form-user-login-password"
                    placeholder="Enter your password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-user-login"
            className="w-full flex-center"
            disabled={form.formState.isSubmitting}
            
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Field>
      </CardFooter>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="text-sm text-primary/80 hover:underline"
        >
          Register
        </Link>
        .
      </p>
    </Card>
  );
}

export default UserLoginFrom;
