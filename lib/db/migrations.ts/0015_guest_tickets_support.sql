-- Migration: Guest Tickets Support
-- Purpose: Allow tickets and orders to exist without user accounts for manual/offline sales
-- Changes: Make tickets.userId and orders.userId nullable, update foreign key constraints

-- Step 1: Make tickets.userId nullable
ALTER TABLE "tickets" ALTER COLUMN "user_id" DROP NOT NULL;

-- Step 2: Update foreign key to SET NULL instead of CASCADE
-- This preserves ticket/order records even if the associated user account is deleted
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_user_id_fkey";
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"(id) ON DELETE SET NULL;

-- Step 3: Make orders.userId nullable
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;

-- Step 4: Update foreign key to SET NULL instead of CASCADE
-- This preserves order records even if the associated user account is deleted
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_fkey";
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"(id) ON DELETE SET NULL;
