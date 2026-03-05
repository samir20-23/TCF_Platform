CREATE TABLE IF NOT EXISTS public.actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type public.actor_type,
  actor_id uuid,
  action_type varchar,
  target_type varchar,
  target_id uuid,
  details text,
  ip varchar,
  user_agent text,
  created_at timestamptz DEFAULT now()
);