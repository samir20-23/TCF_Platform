  INSERT INTO "public"."user_profiles" ("id", "email", "first_name", "last_name", "full_name", "avatar_url", "phone", "role", "status", "study_goal", "target_score", "preferred_study_time", "created_at", "updated_at", "auth_uid") VALUES ('1b290e2c-61b8-47f0-8611-597d0ee45d5a', 'instructeur@tcfcanada.com', 'Marie', 'Leclerc', 'Marie Leclerc', '', null, 'instructor', 'Actif', null, null, null, '2026-01-27 13:49:07.346356+00', '2026-01-27 13:49:07.346356+00', '1b290e2c-61b8-47f0-8611-597d0ee45d5a'), ('289eb6ed-13f8-44b9-9d58-79c97710eb7f', 'admin@tcfcanada.com', 'Administrateur', 'Démo', 'Administrateur Démo', '', null, 'admin', 'Actif', null, null, null, '2026-01-27 15:04:20.474801+00', '2026-01-27 15:04:20.474801+00', '289eb6ed-13f8-44b9-9d58-79c97710eb7f'), ('72cd0b61-9c8e-4a8f-b5d1-e6e2b3c4d57a', 'student@gmail.com', 'Marie', 'Curie', 'Marie Curie', null, null, 'student', 'Actif', null, null, null, '2026-01-28 23:27:58.699186+00', '2026-01-28 23:27:58.699186+00', null); 


and 
INSERT INTO "public"."courses" ("id", "title", "section", "description", "image_url", "image_alt", "total_lessons", "estimated_hours", "is_locked", "required_subscription", "display_order", "created_at", "updated_at", "slug", "published", "is_published", "is_sequential", "thumbnail_url", "subscription_required") VALUES ('1a0cc363-0f21-4347-a25d-998cf6d51a09', 'Compréhension Orale Express', 'Compréhension orale', 'Master French listening in weeks.', null, null, '3', '0.00', 'false', 'Gratuit', '0', '2026-01-28 11:28:21.982342+00', '2026-01-28 11:28:21.982342+00', 'comprehension-orale-express', 'true', 'true', 'true', null, 'false'), ('2872c239-20cd-470d-b7a7-063d8ed0d222', 'big test ', 'Compréhension écrite', '
test tes tes tes tes ', null, null, '0', '0.00', 'false', 'Gratuit', '8', '2026-01-29 15:45:57.054564+00', '2026-01-29 15:45:57.054564+00', 'big-test--i6pwr', 'false', 'false', 'true', null, 'false'), ('2f9ad3db-5c2a-49aa-81f4-dcb80faa8eec', 'Compréhension orale - Niveau 1', 'Compréhension orale', 'Développez vos compétences d''écoute en français avec des exercices pratiques et des vidéos authentiques.', 'https://images.unsplash.com/photo-1719466162727-4d6b561484d5', 'Jeune femme portant des écouteurs blancs étudiant avec un ordinateur portable dans une bibliothèque moderne', '20', '8.00', 'false', 'Gratuit', '1', '2026-01-26 19:13:11.41654+00', '2026-01-26 19:13:11.41654+00', 'comprhension-orale---niveau-1-2f9ad3db', 'true', 'true', 'true', null, 'false');

and 

INSERT INTO "public"."user_statistics" ("id", "user_id", "total_study_hours", "current_streak_days", "longest_streak_days", "completed_lessons_count", "average_quiz_score", "last_activity_date", "created_at", "updated_at") VALUES ('3449ecdb-3d26-4fc7-99aa-2493c85ba23b', '456e7f46-f204-4de7-bde6-c48999f23300', '0.00', '0', '0', '0', '0', null, '2026-01-28 23:27:58.699186+00', '2026-01-28 23:27:58.699186+00');


and 

INSERT INTO "public"."user_lesson_progress" ("id", "user_id", "lesson_id", "is_completed", "completed_at", "time_spent_minutes", "quiz_score", "created_at", "updated_at") VALUES ('27f7bce9-2f97-47cf-becd-71800b1b6aa5', 'db34ca01-4fcd-47ef-b374-b3e7966290f5', '50931910-cc6f-4be6-98fd-32fd44a17cda', 'false', null, '20', null, '2026-01-26 19:13:11.41654+00', '2026-01-26 19:13:11.41654+00');
 and 

INSERT INTO "public"."user_course_enrollments" ("id", "user_id", "course_id", "enrolled_at", "last_accessed_at", "completed_lessons", "progress_percentage", "is_completed", "completed_at") VALUES ('c30dd6b0-f15a-4071-93a7-d8addae6df5a', 'db34ca01-4fcd-47ef-b374-b3e7966290f5', '2f9ad3db-5c2a-49aa-81f4-dcb80faa8eec', '2025-12-27 19:13:11.41654+00', '2026-01-26 19:13:11.41654+00', '2', '10', 'false', null);

and 

INSERT INTO "public"."user_achievements" ("id", "user_id", "title", "description", "icon_name", "category", "unlocked_at", "is_new") VALUES ('24de1794-33b9-4cd7-ad83-1af691bcf960', 'db34ca01-4fcd-47ef-b374-b3e7966290f5', 'Expert en écoute', 'Obtenez 90% ou plus dans 5 quiz d''écoute', 'StarIcon', 'excellence', '2026-01-21 19:13:11.41654+00', 'true');

that is empty i dont know what so some tables i semtpy i think i dont use it in my app so all this we talking about it 
   

and 

INSERT INTO "public"."subscriptions" ("id", "user_id", "subscription_type", "start_date", "expiry_date", "is_active", "auto_renew", "created_at", "updated_at", "stripe_subscription_id", "stripe_customer_id", "plan_id", "current_period_start", "current_period_end", "cancel_at", "canceled_at", "trial_start", "trial_end") VALUES ('010a147c-ff6e-4405-b6e2-5b032ba48fb1', '7591e8fa-377f-4570-b942-773163113620', 'Gratuit', '2026-01-28 23:27:58.699186+00', null, 'true', 'false', '2026-01-28 23:27:58.699186+00', '2026-01-28 23:27:58.699186+00', null, null, null, null, null, null, null, null, null);

and 

create table public.submissions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  lesson_id uuid not null,
  text text null,
  file_url text null,
  word_count integer null,
  score numeric(5, 2) null,
  max_score numeric(5, 2) null default 20,
  status public.submission_status not null default 'DRAFT'::submission_status,
  feedback text null,
  feedback_audio_url text null,
  reviewed_by uuid null,
  reviewed_at timestamp with time zone null,
  created_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  last_saved_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  submitted_at timestamp with time zone null,
  constraint submissions_pkey primary key (id),
  constraint submissions_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint submissions_reviewed_by_fkey foreign KEY (reviewed_by) references user_profiles (id) on delete set null,
  constraint submissions_user_id_fkey foreign KEY (user_id) references user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_submissions_user_id on public.submissions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_submissions_lesson_id on public.submissions using btree (lesson_id) TABLESPACE pg_default;

create index IF not exists idx_submissions_status on public.submissions using btree (status) TABLESPACE pg_default;

create index IF not exists idx_submissions_reviewed_by on public.submissions using btree (reviewed_by) TABLESPACE pg_default;

create trigger submissions_last_saved BEFORE
update on submissions for EACH row
execute FUNCTION update_last_saved_at (); 

and 

create table public.questions (
  id uuid not null default gen_random_uuid (),
  test_id uuid not null,
  position integer not null default 0,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  points integer null default 1,
  created_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  constraint questions_pkey primary key (id),
  constraint questions_test_id_fkey foreign KEY (test_id) references practice_tests (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_questions_test_id on public.questions using btree (test_id) TABLESPACE pg_default;

create index IF not exists idx_questions_position on public.questions using btree (test_id, "position") TABLESPACE pg_default; 

 and 

create table public.practice_tests (
  id uuid not null default gen_random_uuid (),
  lesson_id uuid not null,
  title text not null,
  description text null,
  duration_seconds integer not null default 1800,
  passing_score integer null default 60,
  max_attempts integer null default 3,
  shuffle_questions boolean null default false,
  show_correct_answers boolean null default true,
  created_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  constraint practice_tests_pkey primary key (id),
  constraint practice_tests_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_practice_tests_lesson_id on public.practice_tests using btree (lesson_id) TABLESPACE pg_default;

create trigger practice_tests_updated_at BEFORE
update on practice_tests for EACH row
execute FUNCTION update_practice_tests_updated_at (); 
and 

INSERT INTO "public"."plans" ("id", "stripe_product_id", "stripe_price_id", "name", "name_fr", "description", "description_fr", "price_cents", "currency", "interval", "interval_count", "features", "limitations", "active", "display_order", "is_popular", "trial_days", "created_at", "updated_at") VALUES ('7a12f57c-0d22-495c-98e4-8d55567e6c2d', null, null, 'Basic', 'Basique', 'Essential features', 'Fonctionnalités essentielles pour les apprenants sérieux', '1999', 'CAD', 'month', '1', '["All Free features", "Unlimited practice tests", "Detailed explanations", "Listening exercises", "Priority email support"]', '[]', 'true', '2', 'false', '0', '2026-01-26 19:26:47.525697+00', '2026-01-27 18:19:57.747355+00');

and 

create table public.payment_history (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  subscription_id uuid null,
  amount numeric(10, 2) not null,
  currency text not null default 'CAD'::text,
  payment_method text not null,
  payment_status public.payment_status not null default 'pending'::payment_status,
  transaction_id text null,
  plan_name text not null,
  payment_date timestamp with time zone not null default CURRENT_TIMESTAMP,
  created_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  stripe_session_id text null,
  stripe_payment_intent_id text null,
  stripe_invoice_id text null,
  amount_cents integer null,
  receipt_url text null,
  refunded boolean null default false,
  refunded_at timestamp with time zone null,
  constraint payment_history_pkey primary key (id),
  constraint payment_history_subscription_id_fkey foreign KEY (subscription_id) references subscriptions (id) on delete set null,
  constraint payment_history_user_id_fkey foreign KEY (user_id) references user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_payment_history_user_id on public.payment_history using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_payment_history_payment_status on public.payment_history using btree (payment_status) TABLESPACE pg_default;

create index IF not exists idx_payment_history_stripe_session_id on public.payment_history using btree (stripe_session_id) TABLESPACE pg_default;

and 

INSERT INTO "public"."lessons" ("id", "course_id", "title", "description", "duration_minutes", "difficulty", "video_url", "content_url", "display_order", "created_at", "updated_at", "type", "content", "media_url", "published", "pdf_url", "audio_url", "is_published", "is_preview") VALUES ('0f4c8e7d-a88d-4762-8347-b9c8c3dead8c', '2f9ad3db-5c2a-49aa-81f4-dcb80faa8eec', 'Introduction à la compréhension orale', 'Découvrez les bases de la compréhension orale et les stratégies d''écoute efficaces.', '30', 'Débutant', null, null, '1', '2026-01-26 19:13:11.41654+00', '2026-01-26 19:13:11.41654+00', 'LISTENING', '{}', null, 'true', null, null, 'true', 'false'), ('2bd391f4-1f66-472b-bcc9-912bf4db532d', '9bf04346-380d-49f0-bdfd-f6a91d661db8', 'test', '', '15', 'Débutant', null, null, '1', '2026-01-29 14:15:11.996401+00', '2026-01-29 14:15:11.996401+00', 'WRITING', '{}', null, 'false', null, null, 'false', 'false'); 

and 


create table public.contact_submissions (
  id uuid not null default gen_random_uuid (),
  first_name text not null,
  last_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamp with time zone null default now(),
  status text not null default 'new'::text,
  constraint contact_submissions_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_contact_submissions_status on public.contact_submissions using btree (status) TABLESPACE pg_default;

create index IF not exists idx_contact_submissions_created_at on public.contact_submissions using btree (created_at desc) TABLESPACE pg_default;

and 

create table public.audio_files (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  url text not null,
  purpose text not null,
  file_name text null,
  mime_type text null,
  size_bytes integer null,
  duration_seconds integer null,
  transcription text null,
  created_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  constraint audio_files_pkey primary key (id),
  constraint audio_files_owner_id_fkey foreign KEY (owner_id) references user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_audio_files_owner_id on public.audio_files using btree (owner_id) TABLESPACE pg_default;

create index IF not exists idx_audio_files_purpose on public.audio_files using btree (purpose) TABLESPACE pg_default; 

and 

create table public.admin_activity_log (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  user_name text not null,
  user_email text not null,
  action text not null,
  status text not null default 'success'::text,
  created_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  constraint admin_activity_log_pkey primary key (id),
  constraint admin_activity_log_user_id_fkey foreign KEY (user_id) references user_profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_admin_activity_log_created_at on public.admin_activity_log using btree (created_at desc) TABLESPACE pg_default; 