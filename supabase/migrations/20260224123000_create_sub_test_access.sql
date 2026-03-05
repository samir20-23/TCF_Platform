CREATE TABLE IF NOT EXISTS public.sub_test_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  plan_test_id uuid NOT NULL REFERENCES public.plan_tests(id) ON DELETE CASCADE,
  remaining_attempts int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);