-- PROPOSAL: Add missing columns to support dynamic plan management and PayPal
-- Run this in Supabase SQL Editor if approved.

ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS currency varchar DEFAULT 'CAD',
ADD COLUMN IF NOT EXISTS billing_type varchar DEFAULT 'one-time',
ADD COLUMN IF NOT EXISTS stripe_price_id varchar,
ADD COLUMN IF NOT EXISTS paypal_plan_id varchar,
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Update existing plans with defaults if necessary
UPDATE public.plans SET currency = 'MAD', billing_type = 'one-time', active = true WHERE currency IS NULL;
