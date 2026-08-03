-- Add has_seen_welcome column to users table
-- This is a safe operation that won't delete any existing data
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_seen_welcome" boolean DEFAULT false NOT NULL;