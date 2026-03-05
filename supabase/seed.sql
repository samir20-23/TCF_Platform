CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$
DECLARE student_uuid UUID := gen_random_uuid();
admin_uuid UUID := gen_random_uuid();
instructor_uuid UUID := gen_random_uuid();
admin_gmail_uuid UUID := gen_random_uuid();
course_co_uuid UUID := gen_random_uuid();
course_ce_uuid UUID := gen_random_uuid();
course_ee_uuid UUID := gen_random_uuid();
course_eo_uuid UUID := gen_random_uuid();
lesson1_uuid UUID := gen_random_uuid();
lesson2_uuid UUID := gen_random_uuid();
lesson3_uuid UUID := gen_random_uuid();
lesson4_uuid UUID := gen_random_uuid();
lesson5_uuid UUID := gen_random_uuid();
test1_uuid UUID := gen_random_uuid();
test2_uuid UUID := gen_random_uuid();
q1_uuid UUID := gen_random_uuid();
q2_uuid UUID := gen_random_uuid();
q3_uuid UUID := gen_random_uuid();
q4_uuid UUID := gen_random_uuid();
q5_uuid UUID := gen_random_uuid();
BEGIN DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'admin_activity_log'
        AND table_schema = 'public'
) THEN
DELETE FROM public.admin_activity_log
WHERE user_email IN (
        'etudiant@tcfcanada.com',
        'admin@tcfcanada.com',
        'instructeur@tcfcanada.com'
    );
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'test_attempts'
        AND table_schema = 'public'
) THEN
DELETE FROM public.test_attempts
WHERE user_id IN (
        SELECT id
        FROM public.user_profiles
        WHERE email IN (
                'etudiant@tcfcanada.com',
                'admin@tcfcanada.com',
                'instructeur@tcfcanada.com'
            )
    );
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'submissions'
        AND table_schema = 'public'
) THEN
DELETE FROM public.submissions
WHERE user_id IN (
        SELECT id
        FROM public.user_profiles
        WHERE email IN (
                'etudiant@tcfcanada.com',
                'admin@tcfcanada.com',
                'instructeur@tcfcanada.com'
            )
    );
END IF;
END $$;
INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role,
        created_at
    )
VALUES (
        student_uuid,
        'etudiant@tcfcanada.com',
        'Émilie',
        'Dubois',
        '',
        'student'::public.user_role,
        now()
    ),
    (
        admin_uuid,
        'admin@tcfcanada.com',
        'Administrateur',
        'Système',
        '',
        'admin'::public.user_role,
        now()
    ),
    (
        instructor_uuid,
        'instructeur@tcfcanada.com',
        'Marie',
        'Leclerc',
        '',
        'instructor'::public.user_role,
        now()
    ),
    (
        admin_gmail_uuid,
        'admin@gmail.com',
        'Admin',
        'User', 
        '',
        'admin'::public.user_role,
        now()
    ) ON CONFLICT (email) DO NOTHING;
IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'gen_salt'
)
AND EXISTS (
    SELECT 1
    FROM pg_namespace
    WHERE nspname = 'auth'
) THEN BEGIN
INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        raw_app_meta_data,
        is_sso_user,
        is_anonymous,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        reauthentication_token,
        reauthentication_sent_at,
        phone,
        phone_change,
        phone_change_token,
        phone_change_sent_at
    )
VALUES (
        student_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'etudiant@tcfcanada.com',
        crypt('Etudiant123!', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        '{"first_name": "Émilie", "last_name": "Dubois", "role": "student"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        false,
        false,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        '',
        0,
        '',
        null,
        null,
        '',
        '',
        null
    ),
    (
        admin_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@tcfcanada.com',
        crypt('Admin123!', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        '{"first_name": "Administrateur", "last_name": "Système", "role": "admin"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        false,
        false,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        '',
        0,
        '',
        null,
        null,
        '',
        '',
        null
    ),
    (
        instructor_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'instructeur@tcfcanada.com',
        crypt('Instructeur123!', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        '{"first_name": "Marie", "last_name": "Leclerc", "role": "instructor"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        false,
        false,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        '',
        0,
        '',
        null,
        null,
        '',
        '',
        null
    ),
    (
        admin_gmail_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@gmail.com',
        crypt('Adminadmin', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        '{"first_name": "Admin", "last_name": "User", "role": "admin"}'::jsonb,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        false,
        false,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        '',
        0,
        '',
        null,
        null,
        '',
        '',
        null
    ) ON CONFLICT (id) DO NOTHING;
EXCEPTION
WHEN others THEN RAISE NOTICE 'Skipping auth.users insertion: %',
SQLERRM;
END;
END IF;
UPDATE public.subscriptions
SET subscription_type = 'Premium'::public.subscription_type,
    expiry_date = CURRENT_TIMESTAMP + INTERVAL '365 days'
WHERE user_id = student_uuid;
UPDATE public.subscriptions
SET subscription_type = 'VIP'::public.subscription_type,
    expiry_date = CURRENT_TIMESTAMP + INTERVAL '365 days'
WHERE user_id = instructor_uuid;
INSERT INTO public.courses (
        id,
        title,
        slug,
        section,
        description,
        image_url,
        image_alt,
        total_lessons,
        estimated_hours,
        is_locked,
        required_subscription,
        display_order
    )
VALUES (
        course_co_uuid,
        'Compréhension orale - Niveau 1',
        'comprehension-orale-n1',
        'Compréhension orale'::public.course_section,
        'Développez vos compétences d''écoute en français avec des exercices pratiques et des dialogues authentiques.',
        'https://images.unsplash.com/photo-1719466162727-4d6b561484d5?w=800',
        'Jeune femme portant des écouteurs blancs étudiant avec un ordinateur portable',
        5,
        8.0,
        false,
        'Gratuit'::public.subscription_type,
        1
    ),
    (
        course_ce_uuid,
        'Compréhension écrite - Niveau 1',
        'comprehension-ecrite-n1',
        'Compréhension écrite'::public.course_section,
        'Améliorez votre compréhension de textes en français avec des stratégies de lecture efficaces.',
        'https://images.unsplash.com/photo-1614257642573-95aafe3e18c4?w=800',
        'Livre ouvert avec des lunettes de lecture',
        4,
        10.0,
        false,
        'Basique'::public.subscription_type,
        2
    ),
    (
        course_ee_uuid,
        'Expression écrite - Techniques essentielles',
        'expression-ecrite-techniques',
        'Expression écrite'::public.course_section,
        'Maîtrisez l''art de l''écriture en français pour réussir le TCF Canada.',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        'Personne écrivant dans un cahier avec un stylo',
        4,
        12.0,
        false,
        'Premium'::public.subscription_type,
        3
    ),
    (
        course_eo_uuid,
        'Expression orale - Préparation intensive',
        'expression-orale-intensive',
        'Expression orale'::public.course_section,
        'Développez votre aisance à l''oral avec des exercices de conversation et de présentation.',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        'Femme professionnelle présentant devant un groupe',
        3,
        15.0,
        true,
        'VIP'::public.subscription_type,
        4
    ) ON CONFLICT DO NOTHING;
END $$;