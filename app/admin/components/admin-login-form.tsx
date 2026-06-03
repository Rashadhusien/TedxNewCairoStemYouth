"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";

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
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES } from "@/constants/routes";
import { signInAdminWithCredentials } from "@/lib/db/actions/auth.action";
import { getSafeCallbackUrl } from "@/lib/auth/route-guards";
import { AdminLoginFormSchema } from "@/lib/validation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(
    searchParams.get("callbackUrl"),
    ROUTES.ADMIN.HOME,
  );

  const form = useForm<z.infer<typeof AdminLoginFormSchema>>({
    resolver: zodResolver(AdminLoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof AdminLoginFormSchema>) {
    const result = await signInAdminWithCredentials(data);

    if (!result.success) {
      toast.error("Admin sign in failed", {
        description: result.error.message,
      });
      return;
    }

    toast.success("Welcome back", {
      description: "You are now signed in to the admin panel.",
    });
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Admin login</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sign in with an admin or organizer account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-admin-login" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-admin-login-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="form-admin-login-email"
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
                  <FieldLabel htmlFor="form-admin-login-password">
                    Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="form-admin-login-password"
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
            form="form-admin-login"
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
    </Card>
  );
}
