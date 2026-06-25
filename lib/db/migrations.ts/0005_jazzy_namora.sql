CREATE TYPE "public"."sponsors_type" AS ENUM('sponsor', 'partner');--> statement-breakpoint
ALTER TABLE "sponsors" ADD COLUMN "type" "sponsors_type" NOT NULL;