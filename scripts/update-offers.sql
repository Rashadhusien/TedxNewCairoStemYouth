-- SQL script to update offers with isFeatured, discountedPrice, and originalPrice
-- Run this in your database or use Drizzle Studio at https://local.drizzle.studio

-- Update existing offers to be featured with pricing
-- Adjust the values below based on your actual offer IDs and desired pricing

-- Example: Update an offer to be featured with pricing
-- UPDATE offers 
-- SET 
--   is_featured = true,
--   discounted_price = 30000,  -- 300.00 EGP
--   original_price = 35000,   -- 350.00 EGP
--   updated_at = NOW()
-- WHERE id = 'your-offer-id-here';

-- Create a sample early bird offer if none exists
INSERT INTO offers (
  id,
  title,
  description,
  type,
  discounted_price,
  original_price,
  is_featured,
  is_active,
  display_order,
  starts_at,
  ends_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Early Bird Special',
  'Get your ticket at a special early bird price before the event! Limited time offer.',
  'early_bird',
  30000,  -- 300.00 EGP
  35000,  -- 350.00 EGP (original price)
  true,   -- is_featured
  true,   -- is_active
  0,      -- display_order
  NOW(),  -- starts_at
  NOW() + INTERVAL '30 days',  -- ends_at (30 days from now)
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Create a sample flash sale offer
INSERT INTO offers (
  id,
  title,
  description,
  type,
  discounted_price,
  original_price,
  is_featured,
  is_active,
  display_order,
  starts_at,
  ends_at,
  badge_label,
  remaining_slots,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Flash Sale - Limited Time',
  'Limited time offer! Only a few tickets left at this price.',
  'promotional',
  28000,  -- 280.00 EGP
  35000,  -- 350.00 EGP (original price)
  true,   -- is_featured
  true,   -- is_active
  1,      -- display_order
  NOW(),
  NOW() + INTERVAL '7 days',  -- ends_at (7 days from now)
  '🔥 Only 50 left!',
  50,     -- remaining_slots
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- View all offers to verify
SELECT 
  id,
  title,
  type,
  discounted_price,
  original_price,
  is_featured,
  is_active,
  starts_at,
  ends_at,
  remaining_slots
FROM offers
ORDER BY display_order, created_at;
