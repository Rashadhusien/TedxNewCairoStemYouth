ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "full_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" TYPE timestamp USING (
  CASE
    WHEN "email_verified" IS TRUE THEN COALESCE("email_verified_at", NOW())
    ELSE NULL
  END
);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified_at";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	"password" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts" USING btree ("user_id");
