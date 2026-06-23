"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { ContactFormSchema } from "@/lib/validation";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

function ContactForm() {
  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      inquiry: "general",
      message: "",
    },
  });

  async function onSubmit(data: z.infer<typeof ContactFormSchema>) {
    const formData = {
      name: data.name,
      email: data.email,
      inquiry: data.inquiry,
      message: data.message,
    };

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formData,
        {
          publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
        },
      );

      if (result.status === 200) {
        toast.success("Message sent successfully", {
          description: "We will get back to you soon.",
        });
      } else {
        toast.error("Failed to send message", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again.",
      });
    }
  }

  return (
    <div className="flex-1 mx-auto w-full">
      <form
        className="w-full  lg:max-w-xl"
        id="form-contact"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-contact-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="form-contact-name"
                  placeholder="Enter your Name"
                  aria-invalid={fieldState.invalid}
                  autoComplete="name"
                  className="py-6 px-4"
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
                <FieldLabel htmlFor="form-user-login-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="form-user-login-email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="py-6 px-4"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-contact-message">Message</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="form-contact-message"
                    placeholder="Enter your message"
                    rows={7}
                    className="min-h-28 resize-none  p-4"
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Field orientation="horizontal" className="mt-4">
          <Button
            type="submit"
            form="form-contact"
            size="lg"
            className="w-full flex-center py-5 text-md font-bold tracking-wider cursor-pointer"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </Field>
      </form>
    </div>
  );
}

export default ContactForm;
