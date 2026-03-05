CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider public.payment_provider,
  provider_payment_id varchar,
  amount_cents int,
  currency varchar DEFAULT 'USD',
  status public.payment_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);