-- Manual Seed for Supabase SQL Editor
-- This file contains all seed data needed for the TCF Canada Platform.
-- Copy and paste this into the Supabase SQL Editor and run.

-- 1. Ensure extensions and types exist (Safely)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('student', 'instructor', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type') THEN
        CREATE TYPE public.subscription_type AS ENUM ('Gratuit', 'Basique', 'Premium', 'VIP');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE public.user_status AS ENUM ('Actif', 'Inactif', 'Suspendu');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('completed', 'pending', 'failed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_section') THEN
        CREATE TYPE public.course_section AS ENUM ('Compréhension orale', 'Compréhension écrite', 'Expression écrite', 'Expression orale');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_difficulty') THEN
        CREATE TYPE public.lesson_difficulty AS ENUM ('Débutant', 'Intermédiaire', 'Avancé');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_type') THEN
        CREATE TYPE public.lesson_type AS ENUM ('READING', 'LISTENING', 'WRITING', 'SPEAKING');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Seed Users (Public Profiles & Auth)
DO $$
DECLARE
    student_uuid UUID := 'd1a2b3c4-e5f6-4a5b-8c9d-e0f1a2b3c4d5';
    admin_uuid UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5';
    instructor_uuid UUID := 'i1b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5';
BEGIN
    -- Public Profiles
    INSERT INTO public.user_profiles (id, email, first_name, last_name, role)
    VALUES
        (student_uuid, 'etudiant@tcfcanada.com', 'Émilie', 'Dubois', 'student'),
        (admin_uuid, 'admin@tcfcanada.com', 'Administrateur', 'Démo', 'admin'),
        (instructor_uuid, 'instructor@tcfcanada.com', 'Jean', 'Prof', 'instructor')
    ON CONFLICT (id) DO NOTHING;

    -- Auth Users (if supported)
    IF EXISTS(SELECT 1 FROM pg_proc WHERE proname='gen_salt') AND EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='auth') THEN
        BEGIN
            INSERT INTO auth.users (
                id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
                created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
                is_sso_user, is_anonymous
            ) VALUES
                (student_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
                 'etudiant@tcfcanada.com', crypt('Etudiant123!', gen_salt('bf', 10)), now(), now(), now(),
                 '{"first_name": "Émilie", "last_name": "Dubois", "role": "student"}'::jsonb,
                 '{"provider": "email", "providers": ["email"]}'::jsonb,
                 false, false),
                (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
                 'admin@tcfcanada.com', crypt('Admin123!', gen_salt('bf', 10)), now(), now(), now(),
                 '{"first_name": "Administrateur", "last_name": "Démo", "role": "admin"}'::jsonb,
                 '{"provider": "email", "providers": ["email"]}'::jsonb,
                 false, false),
                (instructor_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
                 'instructor@tcfcanada.com', crypt('Instructor123!', gen_salt('bf', 10)), now(), now(), now(),
                 '{"first_name": "Jean", "last_name": "Prof", "role": "instructor"}'::jsonb,
                 '{"provider": "email", "providers": ["email"]}'::jsonb,
                 false, false)
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN others THEN 
            RAISE NOTICE 'Skipping auth.users creation: %', SQLERRM;
        END;
    END IF;
END $$;

-- 3. Seed Plans
INSERT INTO public.plans (name, name_fr, description, description_fr, price_cents, currency, interval, features, display_order, is_popular)
VALUES
    ('Free', 'Gratuit', 'Basic access to get started', 'Accès de base pour commencer', 0, 'CAD', 'month',
     '["Access to free lessons", "Basic practice tests", "Progress tracking", "Email support"]'::jsonb, 1, false),
    ('Basic', 'Basique', 'Essential features for serious learners', 'Fonctionnalités essentielles pour les apprenants sérieux', 1999, 'CAD', 'month',
     '["All Free features", "Unlimited practice tests", "Detailed explanations", "Listening exercises", "Priority email support"]'::jsonb, 2, false),
    ('Premium', 'Premium', 'Complete preparation for TCF Canada', 'Préparation complète pour le TCF Canada', 4999, 'CAD', 'month',
     '["All Basic features", "Writing task submissions", "Instructor feedback", "Speaking practice", "Mock exams", "Chat support"]'::jsonb, 3, true),
    ('VIP', 'VIP', 'Ultimate preparation with personalized coaching', 'Préparation ultime avec coaching personnalisé', 9999, 'CAD', 'month',
     '["All Premium features", "1-on-1 tutoring sessions", "Personalized study plan", "Priority review of submissions", "Guaranteed response in 24h", "Phone support"]'::jsonb, 4, false)
ON CONFLICT DO NOTHING;

-- 4. Seed Courses
INSERT INTO public.courses (id, title, section, description, image_url, image_alt, total_lessons, estimated_hours, is_locked, required_subscription, display_order, slug, published)
VALUES
    ('c1b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5', 'Compréhension orale - Niveau 1', 'Compréhension orale', 
     'Développez vos compétences d''écoute en français avec des exercices pratiques et des vidéos authentiques.',
     'https://images.unsplash.com/photo-1719466162727-4d6b561484d5', 'Étudiante avec écouteurs',
     20, 8.0, false, 'Gratuit', 1, 'comprehension-orale-n1', true),
    ('c2b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5', 'Compréhension écrite - Niveau 1', 'Compréhension écrite',
     'Améliorez votre compréhension de textes en français avec des stratégies de lecture efficaces.',
     'https://images.unsplash.com/photo-1614257642573-95aafe3e18c4', 'Livre ouvert',
     18, 10.0, false, 'Basique', 2, 'comprehension-ecrite-n1', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Lessons
INSERT INTO public.lessons (id, course_id, title, description, duration_minutes, difficulty, type, display_order)
VALUES
    ('l1b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5', 'c1b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5', 'Introduction à la compréhension orale', 
     'Découvrez les bases de la compréhension orale.', 30, 'Débutant', 'LISTENING', 1),
    ('l2b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5', 'c1b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5', 'Conversations quotidiennes', 
     'Pratiquez l''écoute de dialogues.', 45, 'Débutant', 'LISTENING', 2)
ON CONFLICT (id) DO NOTHING;

-- 6. Setup Storage Buckets (Manual via SQL)
-- Note: This is usually done via API but we can try to hint the DB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tcf_storage', 'tcf_storage', true, 52428800, '{audio/mpeg,audio/mp3,audio/wav,audio/ogg,video/mp4,video/webm,application/pdf,image/jpeg,image/png}')
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$ BEGIN
    CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'tcf_storage');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tcf_storage');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
