import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find the last modified record in user_lesson_progress that isn't completed
        const { data: progress, error } = await supabase
            .from('user_lesson_progress')
            .select(`
                lesson_id,
                lessons (
                    id,
                    title,
                    courses (
                        slug
                    )
                )
            `)
            .eq('user_id', user.id)
            .eq('is_completed', false)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!progress) {
            return NextResponse.json({ lesson: null });
        }

        const lessonData = Array.isArray(progress.lessons) ? progress.lessons[0] : progress.lessons;
        const courseData = lessonData && Array.isArray(lessonData.courses) ? lessonData.courses[0] : lessonData?.courses;

        if (!lessonData) {
            return NextResponse.json({ lesson: null });
        }

        return NextResponse.json({
            lesson: {
                id: progress.lesson_id,
                title: lessonData.title,
                courses: courseData
            }
        });

    } catch (error: any) {
        console.error('Error fetching resume lesson:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
