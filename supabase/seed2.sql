-- /supabase/seed2.sql
-- Idempotent seeds for public tables
-- Run this in Supabase SQL Editor

-- 1. Create Admin & Student Profiles for existing auth users
DO $$ 
BEGIN
    -- Admin 3
    INSERT INTO public.user_profiles (id, email, first_name, last_name, role)
    SELECT id, email, 'Admin', 'Three', 'admin'::public.user_role
    FROM auth.users WHERE email = 'admin3@gmail.com'
    ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.user_role;

    -- Samir
    INSERT INTO public.user_profiles (id, email, first_name, last_name, role)
    SELECT id, email, 'Samir', 'User', 'student'::public.user_role
    FROM auth.users WHERE email = 'aouladamarsamirr2@gmail.com'
    ON CONFLICT (id) DO UPDATE SET role = 'student'::public.user_role;
END $$;

-- 2. Insert Plans
DO $$ BEGIN
    INSERT INTO public.plans (id, name, name_fr, price_cents, active)
    VALUES 
        ('6c2f3a5e-1d4b-4a5e-9f3a-5e1d4b4a5e9f', 'Premium', 'Premium Plan', 4999, true),
        ('7d3g4b6f-2e5c-5b6f-0g4b-6f2e5c5b6f0g', 'VIP', 'Extra VIP', 9999, true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 3. Insert Courses
DO $$ 
DECLARE
    course_id UUID := 'a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3';
BEGIN
    INSERT INTO public.courses (id, title, slug, section, description, published)
    VALUES (course_id, 'Compréhension Orale Express', 'comprehension-orale-express', 'Compréhension orale', 'Master French listening in weeks.', true)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Insert Lessons
    INSERT INTO public.lessons (id, course_id, title, type, content)
    VALUES 
        ('b2c3d4e5-f6a7-4b5c-c6d7-e8f9a0b1c2d3', course_id, 'Introduction to TCF Listening', 'LISTENING', '{"text": "Welcome to the course!"}'::jsonb)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Note: To create the admin user manually if not present:
-- Use Supabase Dashboard -> Auth -> Add User
-- OR use the following SQL (requires service_role permissions in some environments):
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('8f9723b1-c2a1-44c8-a3b8-65d274a8d870', 'admin3@gmail.com', crypt('admin3admin3', gen_salt('bf')), now(), '{"first_name":"Admin","role":"admin"}')
ON CONFLICT (id) DO NOTHING;
*/
