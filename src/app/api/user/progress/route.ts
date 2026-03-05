import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { lessonId, isCompleted, timeSpentMinutes = 1 } = body;

        if (!lessonId) {
            return NextResponse.json(
                { error: 'lessonId is required' },
                { status: 400 }
            );
        }

        // 1. Update or Insert lesson progress
        const { data: progress, error: progressError } = await supabase
            .from('user_lesson_progress')
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
                is_completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
                time_spent_minutes: timeSpentMinutes,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,lesson_id' })
            .select()
            .single();

        if (progressError) throw progressError;

        // 2. Update course enrollment statistics
        // Find the course ID for this lesson
        const { data: lesson } = await supabase
            .from('lessons')
            .select('course_id')
            .eq('id', lessonId)
            .single();

        if (lesson) {
            const courseId = lesson.course_id;

            // Count completed lessons for this course
            const { count: completedCount } = await supabase
                .from('user_lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_completed', true)
                .in('lesson_id',
                    (await supabase.from('lessons').select('id').eq('course_id', courseId)).data?.map(l => l.id) || []
                );

            // Get total lessons for the course
            const { data: course } = await supabase
                .from('courses')
                .select('total_lessons')
                .eq('id', courseId)
                .single();

            const totalLessons = course?.total_lessons || 1;
            const progressPercent = Math.round(((completedCount || 0) / totalLessons) * 100);

            // Update enrollment
            await supabase
                .from('user_course_enrollments')
                .update({
                    completed_lessons: completedCount || 0,
                    progress_percentage: progressPercent,
                    is_completed: progressPercent === 100,
                    completed_at: progressPercent === 100 ? new Date().toISOString() : null,
                    last_accessed_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .eq('course_id', courseId);

            // 3. Update global user statistics
            const { data: stats } = await supabase
                .from('user_statistics')
                .select('total_study_hours, completed_lessons_count')
                .eq('user_id', user.id)
                .single();

            if (stats) {
                // Find how many total lessons the user has ever completed
                const { count: totalGlobalCompleted } = await supabase
                    .from('user_lesson_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('is_completed', true);

                await supabase
                    .from('user_statistics')
                    .update({
                        total_study_hours: (stats.total_study_hours || 0) + (timeSpentMinutes / 60),
                        completed_lessons_count: totalGlobalCompleted || 0,
                        last_activity_date: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id);
            }
        }

        return NextResponse.json({
            success: true,
            progress
        });
    } catch (error) {
        console.error('Unexpected error in progress API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
