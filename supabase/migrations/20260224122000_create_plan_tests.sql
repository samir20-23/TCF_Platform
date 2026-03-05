CREATE TABLE IF NOT EXISTS public.plan_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  max_attempts int DEFAULT 0,
  manual_correction boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);