-- Seed data for V5 Schema
-- Insert sample course
INSERT INTO public.courses (
    title, 
    slug, 
    description, 
    section, 
    display_order, 
    published, 
    is_published, 
    thumbnail_url, 
    image_url, 
    subscription_required, 
    estimated_hours, 
    total_lessons
) VALUES (
    'Compréhension Orale - Niveau Avancé',
    'comprehension-orale-avance-v5',
    'Cours avancé pour maîtriser la compréhension orale du TCF Canada.',
    'Compréhension orale',
    10,
    true,
    true,
    '/images/courses/co-advanced.jpg',
    '/images/courses/co-advanced.jpg',
    true,
    5.5,
    12
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample lessons for the course
WITH course_row AS (
    SELECT id FROM public.courses WHERE slug = 'comprehension-orale-avance-v5' LIMIT 1
)
INSERT INTO public.lessons (
    course_id,
    title,
    description,
    type,
    display_order,
    published,
    is_published,
    is_preview,
    content_url,
    video_url,
    difficulty,
    duration_minutes
) 
SELECT 
    id,
    'Introduction à la section',
    'Vue d''ensemble des épreuves.',
    'LISTENING',
    1,
    true,
    true,
    true,
    'https://example.com/intro-video.mp4',
    'https://example.com/intro-video.mp4',
    'Avancé',
    15
FROM course_row
ON CONFLICT DO NOTHING;
