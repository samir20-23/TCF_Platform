-- Migration: Fix student access loss when plans are updated
-- Link sub_test_access directly to tests table

-- 1. Add test_id column (allow NULL initially for migration)
ALTER TABLE public.sub_test_access ADD COLUMN test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE;

-- 2. Populate test_id from plan_tests BEFORE we lose the original data (though it might already be lost for some)
UPDATE public.sub_test_access sta
SET test_id = pt.test_id
FROM public.plan_tests pt
WHERE sta.plan_test_id = pt.id;

-- 3. Make test_id NOT NULL and plan_test_id NULLABLE
ALTER TABLE public.sub_test_access ALTER COLUMN test_id SET NOT NULL;
ALTER TABLE public.sub_test_access ALTER COLUMN plan_test_id DROP NOT NULL;

-- 4. (Optional but recommended) Add max_attempts and manual_correction snapshots to sub_test_access 
-- so they don't break if the plan's settings change later for new users.
ALTER TABLE public.sub_test_access ADD COLUMN max_attempts int DEFAULT 5;
ALTER TABLE public.sub_test_access ADD COLUMN manual_correction boolean DEFAULT false;

UPDATE public.sub_test_access sta
SET 
  max_attempts = pt.max_attempts,
  manual_correction = pt.manual_correction
FROM public.plan_tests pt
WHERE sta.plan_test_id = pt.id;

-- 5. Add a unique constraint to prevent duplicate access records for same sub+test
-- DROP INDEX IF EXISTS unique_sub_test;
-- CREATE UNIQUE INDEX unique_sub_test ON public.sub_test_access(subscription_id, test_id);
