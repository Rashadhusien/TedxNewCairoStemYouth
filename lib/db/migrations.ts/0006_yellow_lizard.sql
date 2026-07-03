CREATE TYPE "public"."ticket_tier_type" AS ENUM('vip', 'ip', 'np');--> statement-breakpoint
CREATE TABLE "ticket_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "ticket_tier_type" NOT NULL,
	"label" varchar(255) NOT NULL,
	"subtitle" varchar(255) NOT NULL,
	"price_piastres" integer NOT NULL,
	"features" text[] NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_tiers_type_unique" UNIQUE("type")
);
--> statement-breakpoint
ALTER TABLE "sponsors" ALTER COLUMN "type" SET DEFAULT 'sponsor';--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "payment_gateway_order_id" varchar(255);--> statement-breakpoint
CREATE INDEX "ticket_tiers_type_idx" ON "ticket_tiers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ticket_tiers_active_idx" ON "ticket_tiers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ticket_tiers_display_order_idx" ON "ticket_tiers" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "tickets_gateway_order_idx" ON "tickets" USING btree ("payment_gateway_order_id");