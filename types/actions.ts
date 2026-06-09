import type { z } from "zod";

import {
  AdminLoginFormSchema,
  UserLoginFormSchema,
  UserRegisterFormSchema,
  VerifyEmailActionSchema,
  VerifyEmailSchema,
} from "@/lib/validation";
export type ActionError = {
  message: string;
  details?: Record<string, string[]>;
};

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ActionError | string;
}

export function getActionErrorMessage(
  result: Pick<ActionResponse, "error">,
  fallback = "Something went wrong",
): string {
  if (!result.error) return fallback;
  if (typeof result.error === "string") return result.error;
  return result.error.message;
}

export interface PaginatedResponse<T = unknown> extends ActionResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    isNext: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: Record<string, string[]>;
  };
}

export type AuthCredentails = z.infer<typeof UserRegisterFormSchema>;
export type SignInCredentials = z.infer<typeof UserLoginFormSchema>;
export type AdminSignInCredentials = z.infer<typeof AdminLoginFormSchema>;
export type VerifyEmailValues = z.infer<typeof VerifyEmailSchema>;
export type VerifyEmailActionValues = z.infer<typeof VerifyEmailActionSchema>;
