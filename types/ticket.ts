import type { Coupon, Offer, Ticket } from "@/lib/db/schema";
import type { PurchasableTicketType } from "@/lib/pricing";

export type PaymentMethod = "cash" | "instapay" | "bank_transfer";

export interface PaymentUploadValue {
  url: string;
  publicId: string;
}

export interface TicketPurchaseInput {
  ticketType: PurchasableTicketType;
  paymentMethod: PaymentMethod;
  senderName: string;
  senderPhone: string;
  screenshotUrl: string;
  screenshotPublicId?: string;
  couponCode?: string;
  transactionRef?: string;
  notes?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  discountAmount?: number;
  couponId?: string;
  finalPrice?: number;
}

export interface MyTicketData {
  ticket: Ticket;
  user: {
    fullName: string | null;
    email: string;
  };
}

export type TicketWithRelations = Ticket & {
  user?: { fullName: string | null; email: string; phone: string | null };
  coupon?: Coupon | null;
  offer?: Offer | null;
};
