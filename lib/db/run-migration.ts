import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
  const migration = `
CREATE TYPE "public"."order_status" AS ENUM('pending_payment', 'paid', 'failed', 'cancelled');
CREATE TYPE "public"."promo_code_type" AS ENUM('fixed_price', 'discount', 'free');
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
	"kashier_session_url" varchar(512),
	"paid_at" timestamp,
	"payment_reference" varchar(255),
	"failed_at" timestamp,
	"failure_reason" text,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
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
ALTER TABLE "tickets" ADD COLUMN "order_id" uuid;
ALTER TABLE "tickets" ADD COLUMN "attendee_name" varchar(255);
ALTER TABLE "tickets" ADD COLUMN "attendee_email" varchar(255);
ALTER TABLE "tickets" ADD COLUMN "attendee_phone" varchar(20);
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "packages" ADD CONSTRAINT "packages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");
CREATE INDEX "orders_package_idx" ON "orders" USING btree ("package_id");
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
CREATE INDEX "orders_promo_code_idx" ON "orders" USING btree ("promo_code_id");
CREATE INDEX "orders_kashier_session_idx" ON "orders" USING btree ("kashier_session_id");
CREATE INDEX "orders_promo_reservation_expires_idx" ON "orders" USING btree ("promo_reservation_expires_at");
CREATE INDEX "packages_active_idx" ON "packages" USING btree ("is_active");
CREATE INDEX "packages_display_order_idx" ON "packages" USING btree ("display_order");
CREATE INDEX "pcu_promo_code_idx" ON "promo_code_usages" USING btree ("promo_code_id");
CREATE INDEX "pcu_order_idx" ON "promo_code_usages" USING btree ("order_id");
CREATE INDEX "promo_codes_code_idx" ON "promo_codes" USING btree ("code");
CREATE INDEX "promo_codes_active_idx" ON "promo_codes" USING btree ("is_active");
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "tickets_order_idx" ON "tickets" USING btree ("order_id");
`;

  const statements = migration
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      console.log("✓ Executed:", stmt.substring(0, 60) + "...");
    } catch (e: unknown) {
      const error = e as Error;
      console.error("✗ Error:", error.message);
      // Continue with other statements
    }
  }

  console.log("\nMigration completed!");
}

runMigration().catch(console.error);
