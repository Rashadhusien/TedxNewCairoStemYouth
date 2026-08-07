-- Add is_promo_applicable column to packages table
ALTER TABLE packages ADD COLUMN is_promo_applicable boolean NOT NULL DEFAULT false;

-- Set is_promo_applicable to true for Regular package (existing data migration)
UPDATE packages SET is_promo_applicable = true WHERE name = 'Regular';

-- Add unique constraint on packages.name for idempotent seeding
CREATE UNIQUE INDEX IF NOT EXISTS packages_name_uk ON packages(name);

-- Add partial unique index to prevent duplicate pending orders for same user/package
CREATE UNIQUE INDEX IF NOT EXISTS orders_pending_uk ON orders(user_id, package_id) WHERE status = 'pending_payment';
