-- Add admin_user_id column to orders table to track which admin created the order
-- This is for the admin-assisted ticket purchase feature

ALTER TABLE "orders" 
ADD COLUMN "admin_user_id" UUID REFERENCES "users"(id);

-- Create index for filtering by admin
CREATE INDEX "orders_admin_user_idx" ON "orders"("admin_user_id");
