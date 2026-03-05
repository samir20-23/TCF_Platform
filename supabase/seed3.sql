-- File: supabase/seed/seed_core_data.sql
-- Inserts 1 admin, 1 instructor, 1 student, 1 course, 2 lessons, 1 practice test + questions
-- Uses deterministic UUIDs for testing convenience.

BEGIN;

-- Profiles (deterministic UUIDs)
INSERT INTO profiles (id, email, first_name, last_name, full_name, role, email_verified, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111','admin@example.com','Admin','User','Admin User','ADMIN', true, now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, full_name, role, email_verified, created_at, updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222222','instructor@example.com','Ingrid','Tutor','Ingrid Tutor','INSTRUCTOR', true, now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, full_name, role, email_verified, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333333','student@example.com','Samir','Aoulad','Samir Aoulad','STUDENT', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Plan (free)
INSERT INTO plans (id, stripe_product_id, stripe_price_id, name, price_cents, currency, interval, features, active, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL, 'Gratuit', 0, 'CAD', 'month', '[]'::jsonb, true, now())
ON CONFLICT (id) DO NOTHING;

-- Course
INSERT INTO courses (id, title, slug, section, description, published, created_at, updated_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TCF Canada - Sample Course', 'sample-course', 'Compréhension écrite', 'Sample course for testing', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Lessons (two)
INSERT INTO lessons (id, course_id, title, type, description, content, display_order, created_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','cccccccc-cccc-cccc-cccc-cccccccccccc', 'Reading: Short Text', 'READING', 'Short reading exercise', jsonb_build_object('body','This is a sample reading passage.'), 1, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, course_id, title, type, description, content, display_order, created_at)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','cccccccc-cccc-cccc-cccc-cccccccccccc', 'Listening: Short Audio', 'LISTENING', 'Short listening exercise', jsonb_build_object('note','Audio-based question placeholder'), 2, now())
ON CONFLICT (id) DO NOTHING;

-- Practice test for lesson 1 (reading)
INSERT INTO practice_tests (id, lesson_id, title, duration_seconds, passing_score, created_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff','dddddddd-dddd-dddd-dddd-dddddddddddd', 'Reading Sample Test', 600, 60, now())
ON CONFLICT (id) DO NOTHING;

-- Questions for the practice test (2 MCQs)
INSERT INTO questions (id, test_id, position, qtype, payload_json, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001','ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 'multiple_choice',
    jsonb_build_object(
      'question','What is the main idea of the passage?',
      'options', jsonb_build_array('Option A','Option B','Option C','Option D'),
      'correct','Option A'
    ), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, test_id, position, qtype, payload_json, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000002','ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 'multiple_choice',
    jsonb_build_object(
      'question','Which statement is true?',
      'options', jsonb_build_array('A','B','C','D'),
      'correct','C'
    ), now())
ON CONFLICT (id) DO NOTHING;

-- Small sample enrollment for the student (auto-enroll in sample course)
INSERT INTO user_course_enrollments (id, user_id, course_id, enrolled_at, progress_percentage)
VALUES
  ('99999999-9999-9999-9999-999999999999','33333333-3333-3333-3333-333333333333','cccccccc-cccc-cccc-cccc-cccccccccccc', now(), 0)
ON CONFLICT (id) DO NOTHING;

-- Optional: create a free subscription row for the student
INSERT INTO subscriptions (id, user_id, plan_id, subscription_type, is_active, created_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Gratuit', true, now())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Quick check selects (useful after seeding)
-- SELECT id,email,role FROM profiles;
-- SELECT id,title FROM courses;
-- SELECT id,title FROM practice_tests;
