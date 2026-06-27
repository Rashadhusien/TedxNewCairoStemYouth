/**
 * TEDxNewCairoSTEMYouth — Luminous Darkness 2026
 * Complete Drizzle ORM Schema
 *
 * Tables:
 *   users, accounts, sessions
 *   tickets
 *   sponsors, booths, booth_questions, booth_scan_requests, booth_scans
 *   surveys, survey_questions, survey_responses
 *   games, game_entries
 *   point_transactions
 *   Views: leaderboard_view
 */

import {
  pgTable,
  pgEnum,
  pgView,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  smallint,
  timestamp,
  date,
  jsonb,
  unique,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "attendee",
  "organizer",
  "admin",
  "sponsor",
]);

export const ticketTypeEnum = pgEnum("ticket_type", [
  "general",
  "vip",
  "organizer",
  "ip", // Industry Professional
  "np", // Non-Profit / Partner
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "pending_payment", // registered, no screenshot yet
  "payment_submitted", // screenshot uploaded, awaiting admin
  "confirmed", // admin approved
  "rejected", // admin rejected
  "checked_in", // scanned at venue door
  "cancelled",
]);

export const couponTypeEnum = pgEnum("coupon_type", [
  "fixed", // Deduct a flat amount in piastres (e.g. 5000 = 50 EGP off)
  "percentage", // Deduct a percentage of the ticket price (0–100)
]);

export const offerTypeEnum = pgEnum("offer_type", [
  "early_bird", // Time-limited discounted price
  "group", // Discount triggered by quantity (e.g. buy 3 get 20% off)
  "bundle", // Specific ticket type combo deal
  "promotional", // Generic banner/campaign with optional discount
]);

export const sponsorTierEnum = pgEnum("sponsor_tier", [
  "visionary",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "inkind",
]);

export const sponsorsTypeEnum = pgEnum("sponsors_type", ["sponsor", "partner"]);

export const scanRequestStatusEnum = pgEnum("scan_request_status", [
  "pending", // attendee scanned, waiting for sponsor
  "approved", // sponsor confirmed
  "rejected", // sponsor rejected
  "expired", // timed out (5 min)
]);

export const gameTypeEnum = pgEnum("game_type", [
  "pre_event_trivia", // available before event on website
  "booth_quest", // QR scan at booths during break
  "be_the_speaker", // random attendee selected on stage
  "lightning_talk", // submit idea, random winner speaks
  "custom",
]);

export const gameStatusEnum = pgEnum("game_status", [
  "locked", // not yet available
  "open", // active and playable
  "closed", // ended
]);

export const pointReasonEnum = pgEnum("point_reason", [
  "booth_scan",
  "survey_completion",
  "game_completion",
  "be_the_speaker_winner",
  "lightning_talk_winner",
  "manual_admin",
  "bonus",
]);

export const speakerTypeEnum = pgEnum("speaker_type", ["main", "keyholder"]);

// ─────────────────────────────────────────────
// USERS & AUTH
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Auth.js adapter display name (OAuth); synced with fullName for credentials users
    name: varchar("name", { length: 255 }),
    // App profile display name (registration form)
    fullName: varchar("full_name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    image: text("image"),
    phone: varchar("phone", { length: 20 }),
    // Legacy: prefer accounts.password for credentials provider
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").notNull().default("attendee"),

    // Attendee demographic profile (collected at registration)
    university: varchar("university", { length: 255 }),
    major: varchar("major", { length: 255 }),
    graduationYear: smallint("graduation_year"),
    age: smallint("age"),

    // Multi-select skills (stored as Postgres text array)
    // Options: 'Software & AI' | 'Robotics & Electronics' | 'Mechanical & Industrial Engineering'
    //          'Civil Engineering & Architecture' | 'Applied Sciences' | 'Business & Finance'
    //          'Entrepreneurship & Startups' | 'Marketing & PR' | 'Design & Media'
    //          'Writing & Research' | 'Leadership & Public Speaking'
    skills: text("skills").array(),

    // GDPR + Egypt Law 151/2020 consent
    // Must be true before ticket purchase is allowed
    dataConsentGiven: boolean("data_consent_given").notNull().default(false),
    dataConsentAt: timestamp("data_consent_at"),

    // Account lifecycle (timestamp for Auth.js adapter compatibility)
    emailVerified: timestamp("email_verified", { mode: "date" }),
    isActive: boolean("is_active").notNull().default(true),

    // For sponsor accounts: which sponsor they manage
    managedSponsorId: uuid("managed_sponsor_id"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    roleIdx: index("users_role_idx").on(t.role),
  }),
);

// OAuth + credentials linked accounts (Auth.js / Drizzle adapter)
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
    // bcrypt hash when provider === "credentials"
    password: text("password"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
    userIdx: index("accounts_user_id_idx").on(t.userId),
  }),
);

// NextAuth v5 sessions (stored in DB)
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email verification tokens
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(), // email
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
  },
  (t) => ({
    pk: unique().on(t.identifier, t.token),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // SHA-256 hash of the raw token sent in the email link
    // Raw token never stored — only the hash
    tokenHash: text("token_hash").notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),

    // Stamped when consumed — makes it one-time use
    usedAt: timestamp("used_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("prt_user_idx").on(t.userId),
    tokenHashIdx: index("prt_token_hash_idx").on(t.tokenHash),
  }),
);

// ─────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: ticketTypeEnum("type").notNull().default("general"),
    status: ticketStatusEnum("status").notNull().default("pending_payment"),

    // UUID used to generate the QR code image — this is what door scanner reads
    qrCode: uuid("qr_code").notNull().unique().defaultRandom(),

    // Final amount charged in EGP piastres (after coupon + offer deductions)
    // 50000 = 500.00 EGP | 0 = free (organizer comps)
    pricePaid: integer("price_paid").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("EGP"),

    // Payment proof (manual screenshot flow)
    paymentMethod: varchar("payment_method", { length: 30 }),
    // 'instapay' | 'vodacash' | 'paymob_card'
    paymentScreenshotUrl: text("payment_screenshot_url"),
    // Supabase Storage public URL
    paymentSenderName: varchar("payment_sender_name", { length: 255 }),
    // Name on bank/wallet used for transfer
    paymentSenderPhone: varchar("payment_sender_phone", { length: 20 }),
    // Phone used for VodaCash / InstaPay
    paymentTransactionRef: varchar("payment_transaction_ref", { length: 100 }),
    // Any reference number the user can provide
    paymentSubmittedAt: timestamp("payment_submitted_at"),
    paymentNotes: text("payment_notes"),
    // Free-text notes from attendee

    // Admin review
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),

    // Door check-in (event day)
    checkedInAt: timestamp("checked_in_at"),
    checkedInBy: uuid("checked_in_by").references(() => users.id),

    // Soft delete
    cancelledAt: timestamp("cancelled_at"),
    cancelledReason: text("cancelled_reason"),
    // Which coupon (if any) was applied at checkout
    couponId: uuid("coupon_id").references(() => coupons.id),

    // Discount value realised in piastres (snapshot at time of purchase)
    // Stored so it remains accurate even if the coupon is later changed
    couponDiscountApplied: integer("coupon_discount_applied")
      .notNull()
      .default(0),

    // Which offer (if any) was active when the ticket was purchased
    offerId: uuid("offer_id").references(() => offers.id),

    // Snapshot of the offer's discounted price at purchase time
    offerPriceApplied: integer("offer_price_applied"),
    // ───────

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("tickets_user_idx").on(t.userId),
    statusIdx: index("tickets_status_idx").on(t.status),
    qrCodeIdx: index("tickets_qr_code_idx").on(t.qrCode),
  }),
);
// ─────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // The code the user types in at checkout (case-insensitive at the app layer)
    code: varchar("code", { length: 50 }).notNull().unique(),

    description: text("description"),

    type: couponTypeEnum("type").notNull(),

    // For type='fixed':      amount in EGP piastres (e.g. 5000 = 50.00 EGP)
    // For type='percentage': ignored — use percentageOff instead
    discountAmount: integer("discount_amount").notNull().default(0),

    // For type='percentage': 0–100 (e.g. 20 = 20% off)
    // For type='fixed':      ignored
    percentageOff: integer("percentage_off").notNull().default(0),

    // Optionally restrict to specific ticket types
    // null = valid for all types
    applicableTicketTypes: text("applicable_ticket_types")
      .array()
      .$type<Array<"general" | "vip" | "organizer" | "ip" | "np">>(),

    // null = unlimited
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),

    // Per-user cap (null = unlimited)
    maxUsesPerUser: integer("max_uses_per_user").notNull().default(1),

    // Validity window
    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),

    // Minimum ticket price in piastres before the coupon applies
    minOrderAmount: integer("min_order_amount").notNull().default(0),

    isActive: boolean("is_active").notNull().default(true),

    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    codeIdx: index("coupons_code_idx").on(t.code),
    activeIdx: index("coupons_active_idx").on(t.isActive),
  }),
);

// ─────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────

export const offers = pgTable(
  "offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", { length: 255 }).notNull(),
    // e.g. "Early Bird — Save 100 EGP before June 30"

    description: text("description"),

    type: offerTypeEnum("type").notNull(),

    // Discounted price in piastres (the price the user pays under this offer)
    // null = offer is purely informational / banner (no price override)
    discountedPrice: integer("discounted_price"),

    // Original price in piastres (shown struck-through in the UI)
    originalPrice: integer("original_price"),

    // Which ticket types this offer applies to
    // null = applies to all types
    applicableTicketTypes: text("applicable_ticket_types")
      .array()
      .$type<Array<"general" | "vip" | "organizer" | "ip" | "np">>(),

    // group offer: how many tickets must be purchased together to qualify
    minQuantity: integer("min_quantity"),

    // Remaining slots (null = unlimited)
    // Decrement atomically when a ticket using this offer is confirmed
    remainingSlots: integer("remaining_slots"),

    // Schedule
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),

    // Homepage / tickets page display
    badgeLabel: varchar("badge_label", { length: 50 }),
    // e.g. "🔥 Only 20 left!" — overrides auto-badge in UI
    displayOrder: smallint("display_order").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),

    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    activeIdx: index("offers_active_idx").on(t.isActive),
    typeIdx: index("offers_type_idx").on(t.type),
    endsAtIdx: index("offers_ends_at_idx").on(t.endsAt),
  }),
);
// ─────────────────────────────────────────────
// SPONSORS & BOOTHS
// ─────────────────────────────────────────────

export const sponsors = pgTable("sponsors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  description: text("description"),
  tier: sponsorTierEnum("tier").notNull(),

  type: sponsorsTypeEnum("type").notNull(),

  // Point multiplier for their booth scans
  // visionary = 2 (20 pts base × 2), gold = 1 (10 pts × 1), etc.
  boothPointMultiplier: integer("booth_point_multiplier").notNull().default(1),

  // Which user account manages this sponsor's dashboard
  // Set by admin after creating the sponsor record
  sponsorUserId: uuid("sponsor_user_id").references(() => users.id),

  // Sponsor-specific survey questions (JSONB array)
  // Only Visionary, Platinum, Gold tiers get this
  // Shape: [{ id: string, question: string, type: 'dropdown'|'radio', options: string[], required: boolean }]
  leadGenQuestions: jsonb("lead_gen_questions").$type<
    Array<{
      id: string;
      question: string;
      type: "dropdown" | "radio";
      options: string[];
      required: boolean;
    }>
  >(),

  // Display order on website sponsor section
  displayOrder: smallint("display_order").notNull().default(0),

  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const booths = pgTable(
  "booths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    // e.g. "EraaSoft Innovation Hub"
    location: varchar("location", { length: 255 }),
    // Physical location label: "Zone A — Row 2"

    // UUID that becomes the QR code printed at the booth
    // URL encoded: /scan/{qrCode}
    qrCode: uuid("qr_code").notNull().unique().defaultRandom(),

    // Base points per successful scan (before sponsor multiplier)
    // Gold booth = 10, Visionary/Red = 20 as per spec
    basePointsPerScan: integer("base_points_per_scan").notNull().default(10),

    // Max times one user can earn points from this booth
    maxScansPerUser: integer("max_scans_per_user").notNull().default(1),

    // Timeout in seconds for sponsor to approve/reject a scan request
    // Default 5 minutes — after that the request expires
    approvalTimeoutSeconds: integer("approval_timeout_seconds")
      .notNull()
      .default(300),

    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    qrCodeIdx: index("booths_qr_code_idx").on(t.qrCode),
    sponsorIdx: index("booths_sponsor_idx").on(t.sponsorId),
  }),
);

// Pool of questions for each booth — a random one is shown per scan
export const boothQuestions = pgTable(
  "booth_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boothId: uuid("booth_id")
      .notNull()
      .references(() => booths.id, { onDelete: "cascade" }),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),

    // The question shown to the attendee on their phone
    // e.g. "What is EraaSoft's newest product launched in 2025?"
    questionText: text("question_text").notNull(),

    // Hint shown to attendee: "Ask the EraaSoft rep at this booth"
    hint: text("hint"),

    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    boothIdx: index("booth_questions_booth_idx").on(t.boothId),
  }),
);

// When attendee scans a booth QR, a pending request is created
// Sponsor rep sees this on their dashboard and taps Approve/Reject
export const boothScanRequests = pgTable(
  "booth_scan_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boothId: uuid("booth_id")
      .notNull()
      .references(() => booths.id, { onDelete: "cascade" }),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Which question was shown to this attendee (randomly selected)
    questionId: uuid("question_id").references(() => boothQuestions.id),

    status: scanRequestStatusEnum("status").notNull().default("pending"),

    // Points that will be awarded if approved
    pointsToAward: integer("points_to_award").notNull(),

    // Who approved/rejected (sponsor user)
    resolvedBy: uuid("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at"),
    rejectionNote: text("rejection_note"),

    // Auto-expire after approvalTimeoutSeconds
    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    // Prevent duplicate pending requests (one active request per user per booth)
    uniquePendingRequest: index("bsr_user_booth_idx").on(t.userId, t.boothId),
    statusIdx: index("bsr_status_idx").on(t.status),
    sponsorIdx: index("bsr_sponsor_idx").on(t.sponsorId),
  }),
);

// Final record of a completed (approved) booth scan
export const boothScans = pgTable(
  "booth_scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scanRequestId: uuid("scan_request_id")
      .notNull()
      .unique()
      .references(() => boothScanRequests.id),
    boothId: uuid("booth_id")
      .notNull()
      .references(() => booths.id),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    questionId: uuid("question_id").references(() => boothQuestions.id),

    pointsAwarded: integer("points_awarded").notNull(),
    scannedAt: timestamp("scanned_at").notNull().defaultNow(),
  },
  (t) => ({
    // A user can only earn points from a booth once (enforced by maxScansPerUser logic too)
    uniqueUserBooth: unique("unique_user_booth").on(t.userId, t.boothId),
    userIdx: index("booth_scans_user_idx").on(t.userId),
  }),
);

// ─────────────────────────────────────────────
// SPEAKERS
// ─────────────────────────────────────────────

export const speakers = pgTable(
  "speakers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 255 }).notNull(),
    description: text("description").notNull(),
    tagline: text("tagline").notNull(),
    type: speakerTypeEnum("type").notNull().default("main"),

    // Element symbol for main speakers (emoji)
    symbol: varchar("symbol", { length: 10 }),

    // Initials for keyholders
    initials: varchar("initials", { length: 10 }),

    // Accent gradient for main speakers (Tailwind classes)
    accent: varchar("accent", { length: 100 }),

    // Role color for main speakers (Tailwind classes)
    roleColor: varchar("role_color", { length: 100 }),

    // Speaker image URL
    imageUrl: text("image_url").notNull(),

    // Display order
    displayOrder: smallint("display_order").notNull().default(0),

    // Soft delete
    deletedAt: timestamp("deleted_at"),

    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    typeIdx: index("speakers_type_idx").on(t.type),
    activeIdx: index("speakers_active_idx").on(t.isActive),
    displayOrderIdx: index("speakers_display_order_idx").on(t.displayOrder),
  }),
);

// ─────────────────────────────────────────────
// SURVEYS
// ─────────────────────────────────────────────

export const surveys = pgTable("surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),

  // 'pre_event_gate'  — required before playing any game
  // 'sponsor_lead_gen' — sponsor-specific questions embedded in ticket flow
  // 'post_event'      — after the event
  type: varchar("type", { length: 30 }).notNull(),

  // If linked to a sponsor, responses are included in their data export
  sponsorId: uuid("sponsor_id").references(() => sponsors.id),

  // If true, games check for a completed response to this survey before allowing play
  isGateForGames: boolean("is_gate_for_games").notNull().default(false),

  isActive: boolean("is_active").notNull().default(true),
  opensAt: timestamp("opens_at"),
  closesAt: timestamp("closes_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const surveyQuestions = pgTable("survey_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id")
    .notNull()
    .references(() => surveys.id, { onDelete: "cascade" }),

  questionText: text("question_text").notNull(),
  questionType: varchar("question_type", { length: 20 }).notNull(),
  // 'dropdown' | 'radio' | 'checkbox' | 'text'

  // For dropdown/radio/checkbox — the choices
  options: text("options").array(),

  isRequired: boolean("is_required").notNull().default(true),
  displayOrder: smallint("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const surveyResponses = pgTable(
  "survey_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surveyId: uuid("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Full answers: [{ questionId: string, answer: string | string[] }]
    answers: jsonb("answers")
      .notNull()
      .$type<Array<{ questionId: string; answer: string | string[] }>>(),

    completedAt: timestamp("completed_at").notNull().defaultNow(),
  },
  (t) => ({
    // One response per user per survey
    uniqueUserSurvey: unique("unique_user_survey").on(t.userId, t.surveyId),
    surveyIdx: index("survey_responses_survey_idx").on(t.surveyId),
    userIdx: index("survey_responses_user_idx").on(t.userId),
  }),
);

// ─────────────────────────────────────────────
// GAMES
// ─────────────────────────────────────────────

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: gameTypeEnum("type").notNull(),
  status: gameStatusEnum("status").notNull().default("locked"),

  // Points awarded on completion / being selected
  pointsReward: integer("points_reward").notNull().default(0),

  // Gate: user must have completed this survey before they can enter this game
  requiresSurveyId: uuid("requires_survey_id").references(() => surveys.id),

  // Scheduling
  opensAt: timestamp("opens_at"),
  closesAt: timestamp("closes_at"),

  // Flexible config per game type (JSONB)
  //
  // pre_event_trivia:
  //   { questions: [{ id, text, options: string[], correctIndex: number, points: number }],
  //     timePerQuestionSeconds: 30, maxAttempts: 1 }
  //
  // be_the_speaker:
  //   { maxWinners: 1, talkDurationMinutes: 10, pointsForWinner: 200 }
  //
  // lightning_talk:
  //   { submissionDeadline: ISO string, pointsForWinner: 150 }
  //
  // booth_quest: no config here — driven by booths table
  config: jsonb("config"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const gameEntries = pgTable(
  "game_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    status: varchar("status", { length: 20 }).notNull().default("entered"),
    // 'entered' | 'in_progress' | 'completed' | 'winner' | 'disqualified'

    // Raw game score (e.g. number of correct answers in trivia)
    score: integer("score").default(0),

    // Actual points awarded to leaderboard (may differ from score)
    pointsAwarded: integer("points_awarded").default(0),

    // be_the_speaker: was this person randomly selected?
    wasSelected: boolean("was_selected").notNull().default(false),
    selectedAt: timestamp("selected_at"),
    selectedBy: uuid("selected_by").references(() => users.id),
    // Admin who triggered the random selection

    // lightning_talk: their submitted talk idea
    submissionText: text("submission_text"),

    completedAt: timestamp("completed_at"),
    enteredAt: timestamp("entered_at").notNull().defaultNow(),

    // Additional flexible metadata
    // trivia: { answers: [{ questionId, selectedIndex, correct, points }] }
    metadata: jsonb("metadata"),
  },
  (t) => ({
    // One entry per user per game
    uniqueUserGame: unique("unique_user_game").on(t.userId, t.gameId),
    gameIdx: index("game_entries_game_idx").on(t.gameId),
    userIdx: index("game_entries_user_idx").on(t.userId),
  }),
);

// ─────────────────────────────────────────────
// POINTS LEDGER
// ─────────────────────────────────────────────

// Every point award or deduction is recorded here.
// Leaderboard totals are computed by summing this table.
// Never mutate — only append. Full audit trail.
export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Positive = earned, negative = deducted (rare, admin only)
    points: integer("points").notNull(),

    reason: pointReasonEnum("reason").notNull(),

    // Polymorphic source reference — links back to the originating record
    sourceType: varchar("source_type", { length: 50 }),
    // 'booth_scan' | 'game_entry' | 'survey_response' | 'manual'
    sourceId: uuid("source_id"),
    // UUID of the booth_scans / game_entries / survey_responses row

    // null = system-generated, UUID = admin who manually awarded
    awardedBy: uuid("awarded_by").references(() => users.id),

    note: text("note"),
    // Optional admin note for manual adjustments

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("pt_user_idx").on(t.userId),
    createdAtIdx: index("pt_created_at_idx").on(t.createdAt),
  }),
);

// ─────────────────────────────────────────────
// LEADERBOARD VIEW
// (PostgreSQL view — computed on the fly, no stale data)
// ─────────────────────────────────────────────

export const leaderboardView = pgView("leaderboard_view").as((qb) =>
  qb
    .select({
      userId: pointTransactions.userId,
      fullName: users.fullName,
      university: users.university,
      totalPoints:
        sql<number>`CAST(SUM(${pointTransactions.points}) AS INTEGER)`.as(
          "total_points",
        ),
      rank: sql<number>`RANK() OVER (ORDER BY SUM(${pointTransactions.points}) DESC)`.as(
        "rank",
      ),
      transactionCount: sql<number>`COUNT(*)::INTEGER`.as("transaction_count"),
      lastActivityAt: sql<Date>`MAX(${pointTransactions.createdAt})`.as(
        "last_activity_at",
      ),
    })
    .from(pointTransactions)
    .innerJoin(users, sql`${pointTransactions.userId} = ${users.id}`)
    .groupBy(pointTransactions.userId, users.fullName, users.university),
);

// ─────────────────────────────────────────────
// RELATIONS (for Drizzle query API)
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  ticket: one(tickets, {
    fields: [users.id],
    references: [tickets.userId],
  }),
  pointTransactions: many(pointTransactions),
  surveyResponses: many(surveyResponses),
  gameEntries: many(gameEntries),
  boothScans: many(boothScans),
  boothScanRequests: many(boothScanRequests),
  session: many(sessions),
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [tickets.reviewedBy],
    references: [users.id],
    relationName: "ticket_reviewer",
  }),
  coupon: one(coupons, {
    fields: [tickets.couponId],
    references: [coupons.id],
  }),
  offer: one(offers, {
    fields: [tickets.offerId],
    references: [offers.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [coupons.createdBy],
    references: [users.id],
    relationName: "coupon_creator",
  }),
  tickets: many(tickets),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [offers.createdBy],
    references: [users.id],
    relationName: "offer_creator",
  }),
  tickets: many(tickets),
}));

export const sponsorsRelations = relations(sponsors, ({ one, many }) => ({
  sponsorUser: one(users, {
    fields: [sponsors.sponsorUserId],
    references: [users.id],
  }),
  booths: many(booths),
  boothScans: many(boothScans),
  surveyResponses: many(surveyResponses),
}));

export const speakersRelations = relations(speakers, ({ one }) => ({
  createdByUser: one(users, {
    fields: [speakers.createdBy],
    references: [users.id],
    relationName: "speaker_creator",
  }),
}));

export const boothsRelations = relations(booths, ({ one, many }) => ({
  sponsor: one(sponsors, {
    fields: [booths.sponsorId],
    references: [sponsors.id],
  }),
  questions: many(boothQuestions),
  scanRequests: many(boothScanRequests),
  scans: many(boothScans),
}));

export const boothScanRequestsRelations = relations(
  boothScanRequests,
  ({ one }) => ({
    booth: one(booths, {
      fields: [boothScanRequests.boothId],
      references: [booths.id],
    }),
    user: one(users, {
      fields: [boothScanRequests.userId],
      references: [users.id],
    }),
    question: one(boothQuestions, {
      fields: [boothScanRequests.questionId],
      references: [boothQuestions.id],
    }),
    resolvedByUser: one(users, {
      fields: [boothScanRequests.resolvedBy],
      references: [users.id],
      relationName: "scan_resolver",
    }),
    scan: one(boothScans, {
      fields: [boothScanRequests.id],
      references: [boothScans.scanRequestId],
    }),
  }),
);

export const gamesRelations = relations(games, ({ one, many }) => ({
  requiredSurvey: one(surveys, {
    fields: [games.requiresSurveyId],
    references: [surveys.id],
  }),
  entries: many(gameEntries),
}));

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  sponsor: one(sponsors, {
    fields: [surveys.sponsorId],
    references: [sponsors.id],
  }),
  questions: many(surveyQuestions),
  responses: many(surveyResponses),
}));

export const pointTransactionsRelations = relations(
  pointTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [pointTransactions.userId],
      references: [users.id],
    }),
    awardedByUser: one(users, {
      fields: [pointTransactions.awardedBy],
      references: [users.id],
      relationName: "point_awarder",
    }),
  }),
);

// ─────────────────────────────────────────────
// TYPE EXPORTS
// (Inferred TypeScript types from schema)
// ─────────────────────────────────────────────

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;

export type Sponsor = typeof sponsors.$inferSelect;
export type NewSponsor = typeof sponsors.$inferInsert;

export type Speaker = typeof speakers.$inferSelect;
export type NewSpeaker = typeof speakers.$inferInsert;

export type Booth = typeof booths.$inferSelect;
export type NewBooth = typeof booths.$inferInsert;

export type BoothQuestion = typeof boothQuestions.$inferSelect;
export type NewBoothQuestion = typeof boothQuestions.$inferInsert;

export type BoothScanRequest = typeof boothScanRequests.$inferSelect;
export type NewBoothScanRequest = typeof boothScanRequests.$inferInsert;

export type BoothScan = typeof boothScans.$inferSelect;
export type NewBoothScan = typeof boothScans.$inferInsert;

export type Survey = typeof surveys.$inferSelect;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type SurveyResponse = typeof surveyResponses.$inferSelect;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type GameEntry = typeof gameEntries.$inferSelect;
export type NewGameEntry = typeof gameEntries.$inferInsert;

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type NewPointTransaction = typeof pointTransactions.$inferInsert;
