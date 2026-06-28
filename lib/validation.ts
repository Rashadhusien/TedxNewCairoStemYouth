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
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export const ResendVerificationSchema = z.object({
  email: z.email("Invalid email address"),
});

export const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  inquiry: z.enum(["sponsor", "general"]).optional(),
  message: z.string().min(5, "must be atleast 5 characters"),
});

const ticketTypeSchema = z.enum(["vip", "ip", "np"]);
const couponTypeSchema = z.enum(["fixed", "percentage"]);
const offerTypeSchema = z.enum([
  "early_bird",
  "group",
  "bundle",
  "promotional",
]);
const paymentMethodSchema = z.enum(["cash", "instapay", "bank_transfer"]);

export const CouponSchema = z
  .object({
    code: z
      .string()
      .min(2, "Code must be at least 2 characters")
      .max(50, "Code must be at most 50 characters"),
    description: z.string().optional(),
    type: couponTypeSchema,
    discountAmount: z.number().int().min(0).default(0),
    percentageOff: z.number().int().min(0).max(100).default(0),
    applicableTicketTypes: z.array(ticketTypeSchema).optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    maxUsesPerUser: z.number().int().positive().default(1),
    validFrom: z.coerce.date().nullable().optional(),
    validUntil: z.coerce.date().nullable().optional(),
    minOrderAmount: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === "fixed" && data.discountAmount <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Fixed discount must be greater than 0",
        path: ["discountAmount"],
      });
    }
    if (data.type === "percentage" && data.percentageOff <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Percentage must be greater than 0",
        path: ["percentageOff"],
      });
    }
  });

export const OfferSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: offerTypeSchema,
  discountedPrice: z.number().int().min(0).nullable().optional(),
  originalPrice: z.number().int().min(0).nullable().optional(),
  applicableTicketTypes: z.array(ticketTypeSchema).optional(),
  minQuantity: z.number().int().positive().nullable().optional(),
  remainingSlots: z.number().int().min(0).nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  badgeLabel: z.string().max(50).optional(),
  displayOrder: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const TicketPurchaseSchema = z.object({
  ticketType: ticketTypeSchema,
  paymentMethod: paymentMethodSchema,
  senderName: z.string().min(1, "Sender name is required"),
  senderPhone: z.string().min(1, "Sender phone is required"),
  screenshotUrl: z.url("A valid screenshot URL is required"),
  screenshotPublicId: z.string().optional(),
  couponCode: z.string().optional(),
  transactionRef: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const ValidateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  ticketType: ticketTypeSchema,
});

export const TicketReviewSchema = z
  .object({
    ticketId: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === "reject" && !data.rejectionReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Rejection reason is required",
        path: ["rejectionReason"],
      });
    }
  });

export const CheckInSchema = z.object({
  qrCode: z.string().uuid("Invalid QR code"),
});

const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export const TicketListSchema = z.object({
  status: z
    .enum([
      "all",
      "pending_payment",
      "payment_submitted",
      "confirmed",
      "rejected",
      "checked_in",
      "cancelled",
    ])
    .default("all"),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

export const CouponListSchema = z.object({
  status: z.enum(["all", "active", "inactive"]).default("all"),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

export const OfferListSchema = z.object({
  status: z.enum(["all", "active", "inactive"]).default("all"),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

export const SponsorListSchema = z.object({
  status: z.enum(["all", "active", "inactive"]).default("all"),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

export const sponsorTierSchema = z.enum([
  "visionary",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "inkind",
]);

export const leadGenQuestionSchema = z.object({
  id: z.string().uuid("Invalid question id"),
  question: z.string().trim().min(1, "Question is required"),

  type: z.enum(["dropdown", "radio"]),

  options: z
    .array(z.string().trim().min(1, "Option cannot be empty"))
    .min(1, "At least one option is required"),

  required: z.boolean(),
});

export const sponsorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name cannot exceed 255 characters"),

  logoUrl: z.string().optional(),

  website: z.string().url("Invalid website URL").optional().or(z.literal("")),

  description: z.string().optional(),

  tier: sponsorTierSchema,
  type: z.enum(["sponsor", "partner"]),

  boothPointMultiplier: z.number().int().positive().optional(),

  sponsorUserId: z.string().uuid().optional(),

  leadGenQuestions: z.array(leadGenQuestionSchema).optional(),

  displayOrder: z.number().int().min(0).optional(),

  isActive: z.boolean(),
});

export const speakerTypeEnum = z.enum(["main", "keyholder"]);

export const speakerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name cannot exceed 255 characters"),

    role: z
      .string()
      .trim()
      .min(1, "Role is required")
      .max(255, "Role cannot exceed 255 characters"),

    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(500, "Description cannot exceed 500 characters"),

    tagline: z
      .string()
      .trim()
      .min(1, "Tagline is required")
      .max(500, "Tagline cannot exceed 500 characters"),

    type: speakerTypeEnum,

    symbol: z.string().max(10).optional(),
    initials: z.string().max(10).optional(),
    accent: z.string().max(100).optional(),
    roleColor: z.string().max(100).optional(),

    imageUrl: z
      .string()
      .trim()
      .min(1, "Image URL is required")
      .url("Invalid image URL"),

    displayOrder: z.number().int().min(0),

    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "main" && !data.symbol) {
      ctx.addIssue({
        code: "custom",
        message: "Symbol is required for main speakers",
        path: ["symbol"],
      });
    }
    if (data.type === "main" && !data.accent) {
      ctx.addIssue({
        code: "custom",
        message: "Accent is required for main speakers",
        path: ["accent"],
      });
    }
    if (data.type === "main" && !data.roleColor) {
      ctx.addIssue({
        code: "custom",
        message: "Role color is required for main speakers",
        path: ["roleColor"],
      });
    }
    if (data.type === "keyholder" && !data.initials) {
      ctx.addIssue({
        code: "custom",
        message: "Initials are required for keyholders",
        path: ["initials"],
      });
    }
  });

export const SpeakerListSchema = z.object({
  type: z.enum(["all", "main", "keyholder"]).default("all"),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

// ── Forgot Password ────────────────────────────────────────────────────────

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

// ── Reset Password ─────────────────────────────────────────────────────────

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be under 72 characters") // bcrypt limit
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const SKILLS_OPTIONS = [
  "Software & AI",
  "Robotics & Electronics",
  "Mechanical & Industrial Engineering",
  "Civil Engineering & Architecture",
  "Applied Sciences",
  "Business & Finance",
  "Entrepreneurship & Startups",
  "Marketing & PR",
  "Design & Media",
  "Writing & Research",
  "Leadership & Public Speaking",
] as const;

export type SkillOption = (typeof SKILLS_OPTIONS)[number];

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long")
    .trim(),
  phone: z
    .string()
    .max(20, "Phone number is too long")
    .regex(/^[\d\s+\-()]*$/, "Invalid phone number format")
    .nullable()
    .transform((v) => v?.trim() || null),
  university: z
    .string()
    .max(255, "University name is too long")
    .nullable()
    .transform((v) => v?.trim() || null),
  major: z
    .string()
    .max(255, "Major name is too long")
    .nullable()
    .transform((v) => v?.trim() || null),
  graduationYear: z
    .number()
    .int()
    .min(2020, "Graduation year seems too far in the past")
    .max(2035, "Graduation year seems too far in the future")
    .nullable()
    .transform((v) => v ?? null),
  age: z
    .number()
    .int()
    .min(16, "Must be at least 16")
    .max(100, "Please enter a valid age")
    .nullable()
    .transform((v) => v ?? null),
  skills: z.array(z.string()),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
