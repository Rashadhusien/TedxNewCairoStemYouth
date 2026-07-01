export type TedxEvent =
  | { event: "user_signed_up"; properties: { intended_ticket_type?: string; referral_source?: string } }
  | { event: "user_logged_in"; properties: { method: "credentials" } }
  | { event: "login_failed"; properties: { reason: "invalid_credentials" | "account_not_found" | "email_not_verified" } }
  | { event: "email_verified"; properties: Record<string, never> }
  | { event: "user_logged_out"; properties: Record<string, never> }
  | { event: "password_reset_requested"; properties: Record<string, never> }
  | { event: "password_reset_completed"; properties: Record<string, never> }
  | { event: "ticket_checkout_started"; properties: { ticket_type: string; price_piastres: number } }
  | { event: "coupon_applied"; properties: { coupon_code: string; discount_type: "fixed" | "percentage"; discount_value: number; ticket_type: string } }
  | { event: "coupon_rejected"; properties: { coupon_code: string; reason: "expired" | "usage_limit_reached" | "not_applicable" | "not_found"; ticket_type: string } }
  | { event: "payment_screenshot_uploaded"; properties: { ticket_id: string; ticket_type: string; payment_method: "instapay" | "vodacash"; amount_piastres: number } }
  | { event: "payment_approved"; properties: { ticket_id: string; ticket_type: string; amount_piastres: number } }
  | { event: "payment_rejected"; properties: { ticket_id: string; ticket_type: string; reason?: string } }
  | { event: "ticket_purchased"; properties: { ticket_id: string; ticket_type: string; amount_piastres: number; coupon_used: boolean; offer_used: boolean; payment_method: "instapay" | "vodacash" } }
  | { event: "ticket_viewed"; properties: { ticket_id: string; ticket_type: string } }
  | { event: "quest_joined"; properties: Record<string, never> }
  | { event: "booth_qr_scanned"; properties: { booth_id: string; booth_name: string; sponsor_name: string } }
  | { event: "booth_scan_approved"; properties: { booth_id: string; booth_name: string; sponsor_name: string; points_awarded: number } }
  | { event: "booth_scan_rejected"; properties: { booth_id: string; booth_name: string; reason: "already_scanned" | "invalid_qr" | "booth_inactive" } }
  | { event: "points_awarded"; properties: { booth_id: string; booth_name: string; sponsor_name: string; points_amount: number; total_points: number; source: "booth_scan" | "bonus" | "admin_grant" } }
  | { event: "leaderboard_viewed"; properties: { context: "venue_screen" | "web_app" } }
  | { event: "quest_completed"; properties: { total_points: number; booths_visited: number } }
  | { event: "rate_limit_hit"; properties: { endpoint: string; identifier_type: "ip" | "email" } }
  | { event: "admin_payment_approved"; properties: { ticket_id: string; ticket_type: string; amount_piastres: number; admin_id: string } }
  | { event: "admin_payment_rejected"; properties: { ticket_id: string; reason?: string; admin_id: string } }
  | { event: "admin_ticket_refunded"; properties: { ticket_id: string; ticket_type: string; amount_piastres: number; admin_id: string } }
  | { event: "admin_coupon_created"; properties: { coupon_code: string; discount_type: "fixed" | "percentage"; discount_value: number; admin_id: string } }
  | { event: "admin_booth_points_granted"; properties: { attendee_id: string; points_amount: number; booth_id: string; admin_id: string } };

export type TedxEventName = TedxEvent["event"];
export type TedxEventProperties<E extends TedxEventName> = Extract<TedxEvent, { event: E }>["properties"];
