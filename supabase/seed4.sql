-- Seed 4: Professional Plans, Tests and Mappings for TCF Canada Prep
-- Currency: MAD (as requested by user)

-- 1. Ensure the plans table has all columns (idempotent helper)
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS currency varchar DEFAULT 'MAD',
ADD COLUMN IF NOT EXISTS billing_type varchar DEFAULT 'one-time',
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- 2. Insert Plans
INSERT INTO public.plans (id, name, price_cents, duration_days, description, currency, billing_type, is_popular, active)
VALUES 
  (
    '11111111-0001-0001-0001-000000000001', 
    'Basique', 
    29900, 
    30, 
    'Compréhension orale (CO)
Compréhension écrite (CE)
Corrections automatiques instantanées
30 jours d''accès complet
Support par email standard', 
    'MAD', 
    'one-time',
    false,
    true
  ),
  (
    '11111111-0001-0001-0001-000000000002', 
    'Premium', 
    49900, 
    60, 
    'Toutes les épreuves (CO, CE, EE, EO)
Corrections manuelles par experts
Simulations en conditions réelles
60 jours d''accès complet
Support prioritaire 24/7', 
    'MAD', 
    'one-time',
    true,
    true
  ),
  (
    '11111111-0001-0001-0001-000000000003', 
    'VIP', 
    79900, 
    90, 
    'Accès illimité à vie (90 jours+)
Coaching stratégique individuel
Corrections express (< 12h)
90 jours d''accompagnement
Ligne WhatsApp dédiée', 
    'MAD', 
    'one-time',
    false,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  duration_days = EXCLUDED.duration_days,
  description = EXCLUDED.description,
  currency = EXCLUDED.currency,
  billing_type = EXCLUDED.billing_type,
  is_popular = EXCLUDED.is_popular,
  active = EXCLUDED.active;

-- 3. Insert Initial Tests (if they don't exist)
INSERT INTO public.tests (id, name, test_type, duration_minutes, description, published)
VALUES 
  ('22222222-0001-0001-0001-000000000001', 'Compréhension Orale - Test 1', 'listening', 35, 'Test de compréhension orale standard TCF Canada', true),
  ('22222222-0001-0001-0001-000000000002', 'Compréhension Écrite - Test 1', 'reading', 60, 'Test de compréhension écrite standard TCF Canada', true),
  ('22222222-0001-0001-0001-000000000003', 'Expression Écrite - Test 1', 'writing', 60, 'Test d''expression écrite avec 3 tâches', true),
  ('22222222-0001-0001-0001-000000000004', 'Expression Orale - Test 1', 'speaking', 12, 'Simulation d''entretien d''expression orale', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Map Tests to Plans (plan_tests)
-- Basique: CO + CE
INSERT INTO public.plan_tests (plan_id, test_id, max_attempts)
VALUES 
  ('11111111-0001-0001-0001-000000000001', '22222222-0001-0001-0001-000000000001', 3),
  ('11111111-0001-0001-0001-000000000001', '22222222-0001-0001-0001-000000000002', 3)
ON CONFLICT DO NOTHING;

-- Premium: All 4 épreuves
INSERT INTO public.plan_tests (plan_id, test_id, max_attempts, manual_correction)
VALUES 
  ('11111111-0001-0001-0001-000000000002', '22222222-0001-0001-0001-000000000001', 10, false),
  ('11111111-0001-0001-0001-000000000002', '22222222-0001-0001-0001-000000000002', 10, false),
  ('11111111-0001-0001-0001-000000000002', '22222222-0001-0001-0001-000000000003', 5, true),
  ('11111111-0001-0001-0001-000000000002', '22222222-0001-0001-0001-000000000004', 5, true)
ON CONFLICT DO NOTHING;

-- VIP: All 4 épreuves (Unlimited/High)
INSERT INTO public.plan_tests (plan_id, test_id, max_attempts, manual_correction)
VALUES 
  ('11111111-0001-0001-0001-000000000003', '22222222-0001-0001-0001-000000000001', 99, false),
  ('11111111-0001-0001-0001-000000000003', '22222222-0001-0001-0001-000000000002', 99, false),
  ('11111111-0001-0001-0001-000000000003', '22222222-0001-0001-0001-000000000003', 99, true),
  ('11111111-0001-0001-0001-000000000003', '22222222-0001-0001-0001-000000000004', 99, true)
ON CONFLICT DO NOTHING;
