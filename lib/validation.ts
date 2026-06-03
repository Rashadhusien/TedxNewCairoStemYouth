import { z } from "zod";

import { majorSkills } from "@/constants";

const skillLabels = majorSkills.map((skill) => skill.label) as [
  string,
  ...string[],
];
const currentYear = new Date().getFullYear();

export const credentialsSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const AdminLoginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const UserLoginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const UserRegisterFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .positive("Age is required")
    .min(13, "You must be at least 13 years old")
    .max(100, "Please enter a valid age"),
  university: z.string().min(1, "University is required"),
  major: z.string().min(1, "Major is required"),
  graduationYear: z
    .number({ error: "Graduation year is required" })
    .int("Graduation year must be a whole number")
    .positive("Graduation year is required")
    .min(currentYear, `Graduation year must be ${currentYear} or later`)
    .max(currentYear + 10, "Please enter a valid graduation year"),
  skills: z
    .array(z.enum(skillLabels))
    .min(3, "Select at least 3 skills")
    .max(3, "Select up to 3 skills"),
  dataConsentGiven: z.boolean().refine((data) => data, {
    message: "You must agree to the data consent",
  }),
  dataConsentAt: z.date().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const otpFieldSchema = z
  .string({ error: "Verification code is required" })
  .min(1, "Verification code is required")
  .regex(/^\d{6}$/, "Enter a valid 6-digit code");

export const VerifyEmailSchema = z.object({
  otp: otpFieldSchema,
});

export const VerifyEmailActionSchema = z.object({
  email: z.email("Invalid email address"),
  otp: otpFieldSchema,
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const ResendVerificationSchema = z.object({
  email: z.email("Invalid email address"),
});
