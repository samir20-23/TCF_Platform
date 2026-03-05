-- ============================================================
-- Seed Data: Plans, Tests, Plan_Tests, Questions, Options
-- Run after all schema migrations.
-- Idempotent: uses ON CONFLICT DO NOTHING.
-- ============================================================

-- ===== PLANS =====
INSERT INTO plans (id, name, price_cents, duration_days, description, created_at) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Bronze', 2999, 30, 'Accès aux tests de compréhension orale et écrite pendant 30 jours. Idéal pour commencer votre préparation.', NOW()),
  ('11111111-0001-0001-0001-000000000002', 'Silver', 4999, 60, 'Accès complet à tous les tests (CO, CE, EO, EE) pendant 60 jours. Correction automatique des QCM et manuelle pour l''écrit et l''oral.', NOW()),
  ('11111111-0001-0001-0001-000000000003', 'Gold', 7999, 90, 'Accès illimité à tous les tests pendant 90 jours avec corrections manuelles détaillées. Support prioritaire.', NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== TESTS (one per type) =====
INSERT INTO tests (id, name, test_type, duration_minutes, description, published, created_at) VALUES
  ('22222222-0002-0002-0002-000000000001', 'Compréhension Orale — Série 1', 'listening', 40, 'Test de compréhension orale avec 20 questions à choix multiples basées sur des enregistrements audio.', true, NOW()),
  ('22222222-0002-0002-0002-000000000002', 'Compréhension Écrite — Série 1', 'reading', 60, 'Test de compréhension écrite avec 20 questions à choix multiples basées sur des textes variés.', true, NOW()),
  ('22222222-0002-0002-0002-000000000003', 'Expression Écrite — Série 1', 'writing', 60, 'Test d''expression écrite composé de 3 tâches : rédaction d''un message, d''un article et d''un essai argumentatif.', true, NOW()),
  ('22222222-0002-0002-0002-000000000004', 'Expression Orale — Série 1', 'speaking', 15, 'Test d''expression orale avec 3 tâches : entretien dirigé, exercice d''interaction et expression d''un point de vue.', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== PLAN_TESTS =====
-- Bronze: CO + CE only, 3 attempts each
INSERT INTO plan_tests (id, plan_id, test_id, max_attempts, manual_correction, created_at) VALUES
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000001', '22222222-0002-0002-0002-000000000001', 3, false, NOW()),
  ('33333333-0003-0003-0003-000000000002', '11111111-0001-0001-0001-000000000001', '22222222-0002-0002-0002-000000000002', 3, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Silver: all 4 types, 5 attempts each
INSERT INTO plan_tests (id, plan_id, test_id, max_attempts, manual_correction, created_at) VALUES
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000002', '22222222-0002-0002-0002-000000000001', 5, false, NOW()),
  ('33333333-0003-0003-0003-000000000004', '11111111-0001-0001-0001-000000000002', '22222222-0002-0002-0002-000000000002', 5, false, NOW()),
  ('33333333-0003-0003-0003-000000000005', '11111111-0001-0001-0001-000000000002', '22222222-0002-0002-0002-000000000003', 5, true, NOW()),
  ('33333333-0003-0003-0003-000000000006', '11111111-0001-0001-0001-000000000002', '22222222-0002-0002-0002-000000000004', 5, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Gold: all 4 types, 10 attempts each
INSERT INTO plan_tests (id, plan_id, test_id, max_attempts, manual_correction, created_at) VALUES
  ('33333333-0003-0003-0003-000000000007', '11111111-0001-0001-0001-000000000003', '22222222-0002-0002-0002-000000000001', 10, false, NOW()),
  ('33333333-0003-0003-0003-000000000008', '11111111-0001-0001-0001-000000000003', '22222222-0002-0002-0002-000000000002', 10, false, NOW()),
  ('33333333-0003-0003-0003-000000000009', '11111111-0001-0001-0001-000000000003', '22222222-0002-0002-0002-000000000003', 10, true, NOW()),
  ('33333333-0003-0003-0003-000000000010', '11111111-0001-0001-0001-000000000003', '22222222-0002-0002-0002-000000000004', 10, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== SAMPLE QUESTIONS (CO — Listening Test) =====
INSERT INTO questions (id, test_id, position, text, q_type, points, created_at) VALUES
  ('44444444-0004-0004-0004-000000000001', '22222222-0002-0002-0002-000000000001', 1, 'Écoutez l''enregistrement. Quel est le sujet principal de cette conversation ?', 'mcq', 1, NOW()),
  ('44444444-0004-0004-0004-000000000002', '22222222-0002-0002-0002-000000000001', 2, 'Écoutez l''extrait. Quelle est la profession de la personne qui parle ?', 'mcq', 1, NOW()),
  ('44444444-0004-0004-0004-000000000003', '22222222-0002-0002-0002-000000000001', 3, 'D''après l''enregistrement, que doit faire l''auditeur ?', 'mcq', 1, NOW())
ON CONFLICT (id) DO NOTHING;

-- Options for Q1
INSERT INTO options (id, question_id, text, is_correct, created_at) VALUES
  ('55555555-0005-0005-0005-000000000001', '44444444-0004-0004-0004-000000000001', 'Un voyage au Canada', false, NOW()),
  ('55555555-0005-0005-0005-000000000002', '44444444-0004-0004-0004-000000000001', 'Une demande d''immigration', true, NOW()),
  ('55555555-0005-0005-0005-000000000003', '44444444-0004-0004-0004-000000000001', 'Une inscription à l''université', false, NOW()),
  ('55555555-0005-0005-0005-000000000004', '44444444-0004-0004-0004-000000000001', 'Une reservation d''hôtel', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Options for Q2
INSERT INTO options (id, question_id, text, is_correct, created_at) VALUES
  ('55555555-0005-0005-0005-000000000005', '44444444-0004-0004-0004-000000000002', 'Médecin', false, NOW()),
  ('55555555-0005-0005-0005-000000000006', '44444444-0004-0004-0004-000000000002', 'Avocat en immigration', true, NOW()),
  ('55555555-0005-0005-0005-000000000007', '44444444-0004-0004-0004-000000000002', 'Professeur de français', false, NOW()),
  ('55555555-0005-0005-0005-000000000008', '44444444-0004-0004-0004-000000000002', 'Agent immobilier', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Options for Q3
INSERT INTO options (id, question_id, text, is_correct, created_at) VALUES
  ('55555555-0005-0005-0005-000000000009', '44444444-0004-0004-0004-000000000003', 'Passer un examen médical', false, NOW()),
  ('55555555-0005-0005-0005-000000000010', '44444444-0004-0004-0004-000000000003', 'Prendre rendez-vous avec un agent', true, NOW()),
  ('55555555-0005-0005-0005-000000000011', '44444444-0004-0004-0004-000000000003', 'Acheter un billet d''avion', false, NOW()),
  ('55555555-0005-0005-0005-000000000012', '44444444-0004-0004-0004-000000000003', 'Remplir un formulaire en ligne', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== SAMPLE QUESTIONS (CE — Reading Test) =====
INSERT INTO questions (id, test_id, position, text, q_type, points, created_at) VALUES
  ('44444444-0004-0004-0004-000000000004', '22222222-0002-0002-0002-000000000002', 1, 'Lisez le texte suivant. Quel est le message principal de l''auteur ?', 'mcq', 1, NOW()),
  ('44444444-0004-0004-0004-000000000005', '22222222-0002-0002-0002-000000000002', 2, 'Selon le texte, quelle est la conséquence mentionnée ?', 'mcq', 1, NOW())
ON CONFLICT (id) DO NOTHING;

-- Options for CE Q1
INSERT INTO options (id, question_id, text, is_correct, created_at) VALUES
  ('55555555-0005-0005-0005-000000000013', '44444444-0004-0004-0004-000000000004', 'L''importance de la diversité culturelle', true, NOW()),
  ('55555555-0005-0005-0005-000000000014', '44444444-0004-0004-0004-000000000004', 'Les avantages de la mondialisation', false, NOW()),
  ('55555555-0005-0005-0005-000000000015', '44444444-0004-0004-0004-000000000004', 'Les défis de l''éducation moderne', false, NOW()),
  ('55555555-0005-0005-0005-000000000016', '44444444-0004-0004-0004-000000000004', 'La protection de l''environnement', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Options for CE Q2
INSERT INTO options (id, question_id, text, is_correct, created_at) VALUES
  ('55555555-0005-0005-0005-000000000017', '44444444-0004-0004-0004-000000000005', 'Une amélioration du système de santé', false, NOW()),
  ('55555555-0005-0005-0005-000000000018', '44444444-0004-0004-0004-000000000005', 'Un enrichissement mutuel des communautés', true, NOW()),
  ('55555555-0005-0005-0005-000000000019', '44444444-0004-0004-0004-000000000005', 'Une augmentation du chômage', false, NOW()),
  ('55555555-0005-0005-0005-000000000020', '44444444-0004-0004-0004-000000000005', 'Un déclin de la production agricole', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== SAMPLE QUESTIONS (EE — Writing Test) =====
INSERT INTO questions (id, test_id, position, text, q_type, points, created_at) VALUES
  ('44444444-0004-0004-0004-000000000006', '22222222-0002-0002-0002-000000000003', 1, 'Tâche 1 : Rédigez un message de 60 à 120 mots pour répondre à une annonce de location d''appartement.', 'writing', 6, NOW()),
  ('44444444-0004-0004-0004-000000000007', '22222222-0002-0002-0002-000000000003', 2, 'Tâche 2 : Rédigez un article de 120 à 180 mots sur les avantages du télétravail.', 'writing', 7, NOW()),
  ('44444444-0004-0004-0004-000000000008', '22222222-0002-0002-0002-000000000003', 3, 'Tâche 3 : Rédigez un essai argumentatif de 180 à 250 mots : « L''intelligence artificielle va-t-elle remplacer les enseignants ? »', 'writing', 7, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== SAMPLE QUESTIONS (EO — Speaking Test) =====
INSERT INTO questions (id, test_id, position, text, q_type, points, created_at) VALUES
  ('44444444-0004-0004-0004-000000000009', '22222222-0002-0002-0002-000000000004', 1, 'Tâche 1 — Entretien dirigé : Présentez-vous (nom, âge, profession, loisirs, raisons de passer le TCF). Durée : 2 minutes.', 'speaking', 6, NOW()),
  ('44444444-0004-0004-0004-000000000010', '22222222-0002-0002-0002-000000000004', 2, 'Tâche 2 — Interaction : Vous êtes dans un café et vous souhaitez organiser une soirée avec un ami. Négociez le lieu, la date et les invités. Durée : 4 minutes.', 'speaking', 7, NOW()),
  ('44444444-0004-0004-0004-000000000011', '22222222-0002-0002-0002-000000000004', 3, 'Tâche 3 — Expression d''un point de vue : « Les réseaux sociaux sont-ils bénéfiques pour la société ? » Exprimez et défendez votre opinion. Durée : 4 minutes.', 'speaking', 7, NOW())
ON CONFLICT (id) DO NOTHING;