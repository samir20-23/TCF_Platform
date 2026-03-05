CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_plans_name ON public.plans(name);
CREATE INDEX IF NOT EXISTS idx_tests_type ON public.tests(test_type);
CREATE INDEX IF NOT EXISTS idx_questions_test_id_pos ON public.questions(test_id, position);
CREATE INDEX IF NOT EXISTS idx_attempts_user_test ON public.attempts(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON public.answers(attempt_id);