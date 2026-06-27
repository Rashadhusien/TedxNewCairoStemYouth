CREATE TYPE "public"."speaker_type" AS ENUM('main', 'keyholder');--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"tagline" text NOT NULL,
	"type" "speaker_type" DEFAULT 'main' NOT NULL,
	"symbol" varchar(10),
	"initials" varchar(10),
	"accent" varchar(100),
	"role_color" varchar(100),
	"image_url" text NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "speakers_type_idx" ON "speakers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "speakers_active_idx" ON "speakers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "speakers_display_order_idx" ON "speakers" USING btree ("display_order");