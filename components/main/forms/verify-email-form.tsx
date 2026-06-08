"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Mail, Loader2 } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  resendVerificationEmail,
  verifyEmail,
} from "@/lib/db/actions/auth.action";
import { VerifyEmailSchema } from "@/lib/validation";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PENDING_REGISTER_PASSWORD_KEY } from "@/constants/auth";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(60);

  const form = useForm<z.infer<typeof VerifyEmailSchema>>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: {
      otp: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!email) {
      toast.error("Missing email", {
        description: "Please register or sign in again.",
      });
      router.replace(ROUTES.REGISTER);
    }
  }, [email, router]);

  useEffect(() => {
    if (seconds === 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  async function onSubmit(data: z.infer<typeof VerifyEmailSchema>) {
    if (!email) return;

    const password = sessionStorage.getItem(PENDING_REGISTER_PASSWORD_KEY);

    const result = await verifyEmail({
      email,
      otp: data.otp,
      password: password ?? undefined,
    });

    if (!result.success) {
      const details = result.error.details?.otp?.[0];
      form.setError("otp", {
        type: "manual",
        message: details ?? result.error.message,
      });
      toast.error("Verification failed", {
        description: result.error.message,
      });
      return;
    }

    sessionStorage.removeItem(PENDING_REGISTER_PASSWORD_KEY);

    if (result.signedIn) {
      toast.success("Email verified", {
        description: "You are now signed in.",
      });
      router.push(ROUTES.HOME);
      return;
    }

    toast.success("Email verified", {
      description: "You can now sign in with your password.",
    });
    router.push(ROUTES.LOGIN);
  }

  async function handleResend() {
    if (!email || seconds > 0) return;

    try {
      setResending(true);

      const result = await resendVerificationEmail({ email });

      if (!result.success) {
        toast.error("Could not resend code", {
          description: result.error.message,
        });
        return;
      }

      setSeconds(60);
      form.clearErrors("otp");
      toast.success("Code sent", {
        description: "A new verification code was sent to your email.",
      });
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <Card className="mx-auto w-full max-w-xl border-border bg-card shadow-lg">
      <CardContent className="space-y-8 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          <h1 className="  text-2xl font-bold">Verify Your Email</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a verification code to
          </p>

          <p className="font-medium text-foreground">{email}</p>
        </div>

        <form
          id="form-verify-email"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <Controller
            name="otp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="mx-auto w-fit flex-center"
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor="form-verify-email-otp" className="sr-only">
                  Verification code
                </FieldLabel>
                <InputOTP
                  id="form-verify-email-otp"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  className="flex-center"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="size-10" />
                    <InputOTPSlot index={1} className="size-10" />
                    <InputOTPSlot index={2} className="size-10" />
                    <InputOTPSlot index={3} className="size-10" />
                    <InputOTPSlot index={4} className="size-10" />
                    <InputOTPSlot index={5} className="size-10" />
                  </InputOTPGroup>
                </InputOTP>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button
            type="submit"
            size="lg"
            form="form-verify-email"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Verify Email
          </Button>
        </form>

        <div className="text-center text-sm">
          {seconds > 0 ? (
            <p className="text-muted-foreground">
              Resend code in{" "}
              <span className="font-medium text-foreground">{seconds}s</span>
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default VerifyEmailForm;
