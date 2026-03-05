-- ====================================================================
-- SEED DATA: TCF Exam Simulation Engine
-- Run this after 20260301_exam_engine.sql migration
-- ====================================================================

-- 1. Grab a Plan ID (assuming Bronze, Silver, or Gold exist)
-- We will just insert 4 real tests and link them to ALL existing active plans for testing purposes,
-- or you can explicitly link them in the UI later.

DO $$
DECLARE
    test1_id UUID := gen_random_uuid();
    test2_id UUID := gen_random_uuid();
    q1_id UUID := gen_random_uuid();
    q2_id UUID := gen_random_uuid();
    q3_id UUID := gen_random_uuid();
    q4_id UUID := gen_random_uuid();
    plan_record RECORD;
BEGIN

    -- Create Test 1: Compréhension Orale & Écrite (MCQ)
    INSERT INTO public.tests (id, name, description, test_type, duration_minutes, total_points, max_attempts, published, created_at)
    VALUES (
        test1_id,
        'TCF Canada - Test Blanc 1 (QCM)',
        'Test d''entraînement couvrant la compréhension orale et écrite.',
        'mixed',
        60,
        2,
        3,
        true,
        now()
    );

    -- Question 1: Listening (Audio)
    INSERT INTO public.questions (id, test_id, text, q_type, position, points, extra_payload)
    VALUES (
        q1_id,
        test1_id,
        'Écoutez l''audio et choisissez la bonne réponse. Que demande l''homme ?',
        'listening',
        1,
        1,
        '{"transcript": "Bonjour, je cherche la gare s''il vous plaît. Pourriez-vous m''indiquer le chemin ?", "replay_limit": 2, "audio_url": "https://example.com/audio1.mp3"}'::jsonb
    );

    -- Options for Q1
    INSERT INTO public.options (question_id, text, is_correct) VALUES
    (q1_id, 'Il veut acheter un billet.', false),
    (q1_id, 'Il cherche son chemin vers la gare.', true),
    (q1_id, 'Il demande l''heure.', false),
    (q1_id, 'Il cherche un arrêt de bus.', false);


    -- Question 2: Reading
    INSERT INTO public.questions (id, test_id, text, q_type, position, points, extra_payload)
    VALUES (
        q2_id,
        test1_id,
        'Lisez le texte et répondez. Quel est le sujet principal de l''article ?',
        'reading',
        2,
        1,
        '{"passage_text": "Le réchauffement climatique a des conséquences majeures sur la biodiversité. De nombreuses espèces voient leur habitat naturel se réduire..."}'::jsonb
    );

    -- Options for Q2
    INSERT INTO public.options (question_id, text, is_correct) VALUES
    (q2_id, 'La météo de demain.', false),
    (q2_id, 'Les impacts du changement climatique.', true),
    (q2_id, 'Les nouveaux animaux de compagnie.', false),
    (q2_id, 'Le tourisme en montagne.', false);


    -- Create Test 2: Expression Écrite & Orale
    INSERT INTO public.tests (id, name, description, test_type, duration_minutes, total_points, max_attempts, published, created_at)
    VALUES (
        test2_id,
        'TCF Canada - Expression 1',
        'Test d''entraînement pour les épreuves d''expression écrite et orale (correction manuelle).',
        'mixed',
        80,
        10,
        3,
        true,
        now()
    );

    -- Question 3: Writing
    INSERT INTO public.questions (id, test_id, text, q_type, position, points, extra_payload)
    VALUES (
        q3_id,
        test2_id,
        'Tâche 1 : Rédigez un message à un ami pour l''inviter à une fête (60 mots minimum).',
        'writing',
        1,
        5,
        '{"min_words": 60, "max_words": 120, "rubric": "Note basée sur l''aisance, le vocabulaire et la grammaire.", "sample_answer": "Salut Alexandre, j''organise une petite fête chez moi ce samedi..."}'::jsonb
    );

    -- Question 4: Speaking
    INSERT INTO public.questions (id, test_id, text, q_type, position, points, extra_payload)
    VALUES (
        q4_id,
        test2_id,
        'Tâche 1 : Présentez-vous en parlant de vos loisirs et de votre profession (2 minutes).',
        'speaking',
        2,
        5,
        '{"max_recording_sec": 120, "rubric": "Note basée sur la prononciation, la fluidité et la richesse du vocabulaire."}'::jsonb
    );

    -- Link these tests to EVERY existing active Plan (Bronze, Silver, Gold, etc)
    -- This guarantees that when a user buys *any* plan, they get these tests in sub_test_access
    FOR plan_record IN SELECT id FROM public.plans WHERE is_active = true
    LOOP
        INSERT INTO public.plan_tests (plan_id, test_id, max_attempts, manual_correction)
        VALUES (plan_record.id, test1_id, 3, false)
        ON CONFLICT DO NOTHING;

        INSERT INTO public.plan_tests (plan_id, test_id, max_attempts, manual_correction)
        VALUES (plan_record.id, test2_id, 3, true)
        ON CONFLICT DO NOTHING;
    END LOOP;

END $$;
