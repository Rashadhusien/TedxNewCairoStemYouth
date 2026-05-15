CREATE TYPE "public"."game_status" AS ENUM('locked', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."game_type" AS ENUM('pre_event_trivia', 'booth_quest', 'be_the_speaker', 'lightning_talk', 'custom');--> statement-breakpoint
CREATE TYPE "public"."point_reason" AS ENUM('booth_scan', 'survey_completion', 'game_completion', 'be_the_speaker_winner', 'lightning_talk_winner', 'manual_admin', 'bonus');--> statement-breakpoint
CREATE TYPE "public"."scan_request_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."sponsor_tier" AS ENUM('visionary', 'platinum', 'gold', 'silver', 'bronze', 'inkind');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('pending_payment', 'payment_submitted', 'confirmed', 'rejected', 'checked_in', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('general', 'vip', 'organizer');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('attendee', 'organizer', 'admin', 'sponsor');--> statement-breakpoint
CREATE TABLE "booth_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booth_id" uuid NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"hint" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booth_scan_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booth_id" uuid NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid,
	"status" "scan_request_status" DEFAULT 'pending' NOT NULL,
	"points_to_award" integer NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"rejection_note" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booth_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_request_id" uuid NOT NULL,
	"booth_id" uuid NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid,
	"points_awarded" integer NOT NULL,
	"scanned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "booth_scans_scan_request_id_unique" UNIQUE("scan_request_id"),
	CONSTRAINT "unique_user_booth" UNIQUE("user_id","booth_id")
);
--> statement-breakpoint
CREATE TABLE "booths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255),
	"qr_code" uuid DEFAULT gen_random_uuid() NOT NULL,
	"base_points_per_scan" integer DEFAULT 10 NOT NULL,
	"max_scans_per_user" integer DEFAULT 1 NOT NULL,
	"approval_timeout_seconds" integer DEFAULT 300 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "booths_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "game_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'entered' NOT NULL,
	"score" integer DEFAULT 0,
	"points_awarded" integer DEFAULT 0,
	"was_selected" boolean DEFAULT false NOT NULL,
	"selected_at" timestamp,
	"selected_by" uuid,
	"submission_text" text,
	"completed_at" timestamp,
	"entered_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "unique_user_game" UNIQUE("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "game_type" NOT NULL,
	"status" "game_status" DEFAULT 'locked' NOT NULL,
	"points_reward" integer DEFAULT 0 NOT NULL,
	"requires_survey_id" uuid,
	"opens_at" timestamp,
	"closes_at" timestamp,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"points" integer NOT NULL,
	"reason" "point_reason" NOT NULL,
	"source_type" varchar(50),
	"source_id" uuid,
	"awarded_by" uuid,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" text,
	"website" text,
	"description" text,
	"tier" "sponsor_tier" NOT NULL,
	"booth_point_multiplier" integer DEFAULT 1 NOT NULL,
	"sponsor_user_id" uuid,
	"lead_gen_questions" jsonb,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" varchar(20) NOT NULL,
	"options" text[],
	"is_required" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_survey" UNIQUE("user_id","survey_id")
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" varchar(30) NOT NULL,
	"sponsor_id" uuid,
	"is_gate_for_games" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"opens_at" timestamp,
	"closes_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "ticket_type" DEFAULT 'general' NOT NULL,
	"status" "ticket_status" DEFAULT 'pending_payment' NOT NULL,
	"qr_code" uuid DEFAULT gen_random_uuid() NOT NULL,
	"price_paid" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'EGP' NOT NULL,
	"payment_method" varchar(30),
	"payment_screenshot_url" text,
	"payment_sender_name" varchar(255),
	"payment_sender_phone" varchar(20),
	"payment_transaction_ref" varchar(100),
	"payment_submitted_at" timestamp,
	"payment_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"checked_in_at" timestamp,
	"checked_in_by" uuid,
	"cancelled_at" timestamp,
	"cancelled_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'attendee' NOT NULL,
	"university" varchar(255),
	"major" varchar(255),
	"graduation_year" smallint,
	"age" smallint,
	"date_of_birth" date,
	"skills" text[],
	"data_consent_given" boolean DEFAULT false NOT NULL,
	"data_consent_at" timestamp,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"managed_sponsor_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token"),
	CONSTRAINT "verification_tokens_identifier_token_unique" UNIQUE("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "booth_questions" ADD CONSTRAINT "booth_questions_booth_id_booths_id_fk" FOREIGN KEY ("booth_id") REFERENCES "public"."booths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_questions" ADD CONSTRAINT "booth_questions_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scan_requests" ADD CONSTRAINT "booth_scan_requests_booth_id_booths_id_fk" FOREIGN KEY ("booth_id") REFERENCES "public"."booths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scan_requests" ADD CONSTRAINT "booth_scan_requests_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scan_requests" ADD CONSTRAINT "booth_scan_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scan_requests" ADD CONSTRAINT "booth_scan_requests_question_id_booth_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."booth_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scan_requests" ADD CONSTRAINT "booth_scan_requests_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scans" ADD CONSTRAINT "booth_scans_scan_request_id_booth_scan_requests_id_fk" FOREIGN KEY ("scan_request_id") REFERENCES "public"."booth_scan_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scans" ADD CONSTRAINT "booth_scans_booth_id_booths_id_fk" FOREIGN KEY ("booth_id") REFERENCES "public"."booths"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scans" ADD CONSTRAINT "booth_scans_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scans" ADD CONSTRAINT "booth_scans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_scans" ADD CONSTRAINT "booth_scans_question_id_booth_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."booth_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booths" ADD CONSTRAINT "booths_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_entries" ADD CONSTRAINT "game_entries_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_entries" ADD CONSTRAINT "game_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_entries" ADD CONSTRAINT "game_entries_selected_by_users_id_fk" FOREIGN KEY ("selected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_requires_survey_id_surveys_id_fk" FOREIGN KEY ("requires_survey_id") REFERENCES "public"."surveys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_awarded_by_users_id_fk" FOREIGN KEY ("awarded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_sponsor_user_id_users_id_fk" FOREIGN KEY ("sponsor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booth_questions_booth_idx" ON "booth_questions" USING btree ("booth_id");--> statement-breakpoint
CREATE INDEX "bsr_user_booth_idx" ON "booth_scan_requests" USING btree ("user_id","booth_id");--> statement-breakpoint
CREATE INDEX "bsr_status_idx" ON "booth_scan_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bsr_sponsor_idx" ON "booth_scan_requests" USING btree ("sponsor_id");--> statement-breakpoint
CREATE INDEX "booth_scans_user_idx" ON "booth_scans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booths_qr_code_idx" ON "booths" USING btree ("qr_code");--> statement-breakpoint
CREATE INDEX "booths_sponsor_idx" ON "booths" USING btree ("sponsor_id");--> statement-breakpoint
CREATE INDEX "game_entries_game_idx" ON "game_entries" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_entries_user_idx" ON "game_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pt_user_idx" ON "point_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pt_created_at_idx" ON "point_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "survey_responses_survey_idx" ON "survey_responses" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "survey_responses_user_idx" ON "survey_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tickets_user_idx" ON "tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_qr_code_idx" ON "tickets" USING btree ("qr_code");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE VIEW "public"."leaderboard_view" AS (select "point_transactions"."user_id", "users"."full_name", "users"."university", CAST(SUM("point_transactions"."points") AS INTEGER) as "total_points", RANK() OVER (ORDER BY SUM("point_transactions"."points") DESC) as "rank", COUNT(*)::INTEGER as "transaction_count", MAX("point_transactions"."created_at") as "last_activity_at" from "point_transactions" inner join "users" on "point_transactions"."user_id" = "users"."id" group by "point_transactions"."user_id", "users"."full_name", "users"."university");