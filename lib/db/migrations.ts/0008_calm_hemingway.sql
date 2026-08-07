CREATE TYPE "public"."order_status" AS ENUM('pending_payment', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."promo_code_type" AS ENUM('fixed_price', 'discount', 'free');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"original_amount_piastres" integer NOT NULL,
	"discount_piastres" integer DEFAULT 0 NOT NULL,
	"final_amount_piastres" integer NOT NULL,
	"package_name" varchar(255) NOT NULL,
	"package_ticket_count" integer NOT NULL,
	"package_price_per_ticket_piastres" integer NOT NULL,
	"promo_code_id" uuid,
	"promo_code" varchar(50),
	"promo_reservation_expires_at" timestamp,
	"access_code" varchar(100),
	"kashier_session_id" varchar(255),
	"kashier_order_id" varchar(255),
	"paid_at" timestamp,
	"payment_reference" varchar(255),
	"failed_at" timestamp,
	"failure_reason" text,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"ticket_count" integer NOT NULL,
	"price_per_ticket_piastres" integer NOT NULL,
	"total_price_piastres" integer NOT NULL,
	"requires_access_code" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_code_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"original_amount_piastres" integer NOT NULL,
	"discount_piastres" integer NOT NULL,
	"final_amount_piastres" integer NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_order_promo" UNIQUE("order_id","promo_code_id")
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"owner" varchar(255),
	"description" text,
	"type" "promo_code_type" NOT NULL,
	"value_piastres" integer DEFAULT 0 NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "order_id" uuid;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "attendee_name" varchar(255);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "attendee_email" varchar(255);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "attendee_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_package_idx" ON "orders" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_promo_code_idx" ON "orders" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "orders_kashier_session_idx" ON "orders" USING btree ("kashier_session_id");--> statement-breakpoint
CREATE INDEX "orders_promo_reservation_expires_idx" ON "orders" USING btree ("promo_reservation_expires_at");--> statement-breakpoint
CREATE INDEX "packages_active_idx" ON "packages" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "packages_display_order_idx" ON "packages" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "pcu_promo_code_idx" ON "promo_code_usages" USING btree ("promo_code_id");--> statement-breakpoint
CREATE INDEX "pcu_order_idx" ON "promo_code_usages" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "promo_codes_code_idx" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "promo_codes_active_idx" ON "promo_codes" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tickets_order_idx" ON "tickets" USING btree ("order_id");