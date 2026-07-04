"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { UserRegisterFormSchema } from "@/lib/validation";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { majorSkills } from "@/constants";
import { registerWithCredentails } from "@/lib/db/actions/auth.action";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { PENDING_REGISTER_PASSWORD_KEY } from "@/constants/auth";
import { PhoneInput } from "@/components/ui/phone-input";
// import { AuthDivider } from "@/components/auth-divider";
// import { GoogleSignInButton } from "@/app/(auth)/google-sign-in-button";

const skillLabels = majorSkills.map((skill) => skill.label);

function UserRegisterFrom() {
  const anchor = useComboboxAnchor();
  const router = useRouter();

  const form = useForm<z.infer<typeof UserRegisterFormSchema>>({
    resolver: zodResolver(UserRegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      age: 0,
      university: "",
      major: "",
      graduationYear: 0,
      skills: [],
      dataConsentGiven: false,
      dataConsentAt: undefined,
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof UserRegisterFormSchema>) {
    const result = await registerWithCredentails(data);

    if (!result.success) {
      toast.error("Registration failed", {
        description: result.error.message,
      });
      return;
    }

    sessionStorage.setItem(PENDING_REGISTER_PASSWORD_KEY, data.password);

    toast.success("Account created", {
      description: "Check your email for a 6-digit verification code.",
    });

    router.push(
      `${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(result.email)}`,
    );
  }

  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your details to register.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-name">
                    Full Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your full name"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-email"
                    placeholder="Enter your email"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-password">
                    Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="form-rhf-demo-password"
                    placeholder="Enter your password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-phone">Phone</FieldLabel>
                  {/* <Input
                    {...field}
                    id="form-rhf-demo-phone"
                    placeholder="Enter your phone number"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  /> */}

                  <PhoneInput
                    {...field}
                    id="form-rhf-demo-phone"
                    placeholder="Enter your phone number"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    defaultCountry="EG"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Controller
              name="age"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-age">Age</FieldLabel>
                  <Input
                    type="number"
                    min={13}
                    max={100}
                    id="form-rhf-demo-age"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value || ""}
                    onChange={(e) => {
                      const next = e.target.valueAsNumber;
                      field.onChange(Number.isNaN(next) ? 0 : next);
                    }}
                    placeholder="Enter your age"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="university"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-university">
                    University / School
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-university"
                    placeholder="Ain Shams, Cairo , etc."
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Controller
              name="major"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-major">
                    Major (Field of Study)
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-major"
                    placeholder="Computer Science, business administration, etc."
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="graduationYear"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-graduationYear">
                    Graduation Year (Expected)
                  </FieldLabel>
                  <Input
                    type="number"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                    id="form-rhf-demo-graduationYear"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value || ""}
                    onChange={(e) => {
                      const next = e.target.valueAsNumber;
                      field.onChange(Number.isNaN(next) ? 0 : next);
                    }}
                    placeholder="2026, 2027, etc."
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Controller
            name="skills"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-demo-skills">Skills</FieldLabel>
                <FieldDescription>
                  Choose your top 3 skills or interests.
                </FieldDescription>
                <Combobox
                  multiple
                  autoHighlight
                  items={skillLabels}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <ComboboxChips
                    ref={anchor}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <ComboboxValue>
                      {(values) => (
                        <React.Fragment>
                          {values.map((value: string) => (
                            <ComboboxChip key={value}>{value}</ComboboxChip>
                          ))}
                          <ComboboxChipsInput id="form-rhf-demo-skills" />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>
                  <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="dataConsentGiven"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    value={field.value ? "true" : "false"}
                    id="form-rhf-demo-dataConsentGiven"
                    aria-invalid={fieldState.invalid}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="size-4! "
                  />
                  <FieldLabel htmlFor="form-rhf-demo-dataConsentGiven">
                    I agree to the{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="text-primary/80 hover:underline"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-primary/80 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </FieldLabel>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-rhf-demo"
            className="w-full flex-center"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </Field>
      </CardFooter>
      {/* <div className="px-6 pb-2">
        <AuthDivider />
        <GoogleSignInButton label="Register with Google" className="w-full" />
      </div> */}
      <p className="text-center text-sm text-muted-foreground">
        Have an Account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-sm text-primary/80 hover:underline"
        >
          Login
        </Link>
      </p>
    </Card>
  );
}

export default UserRegisterFrom;
