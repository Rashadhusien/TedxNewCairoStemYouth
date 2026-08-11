-- Add kashier_session_url column to orders table to persist the exact
-- hosted checkout URL returned by Kashier so it can be resumed later.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "kashier_session_url" varchar(512);
