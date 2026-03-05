import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch user's submissions
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const lessonId = searchParams.get('lessonId');
        const status = searchParams.get('status');

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is instructor/admin (can view all submissions)
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const isInstructor = profile?.role === 'admin';

        // Build query
        let query = supabase
            .from('submissions')
            .select(`
        id,
        user_id,
        lesson_id,
        text,
        file_url,
        word_count,
        score,
        max_score,
        status,
        feedback,
        feedback_audio_url,
        reviewed_by,
        reviewed_at,
        created_at,
        last_saved_at,
        submitted_at,
        lessons(title, type),
        user_profiles!submissions_user_id_fkey(full_name, email)
      `)
            .order('created_at', { ascending: false });

        // If not instructor, only show own submissions
        if (!isInstructor) {
            query = query.eq('user_id', user.id);
        }

        if (lessonId) {
            query = query.eq('lesson_id', lessonId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: submissions, error } = await query;

        if (error) {
            console.error('Error fetching submissions:', error);
            return NextResponse.json(
                { error: 'Failed to fetch submissions' },
                { status: 500 }
            );
        }

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Create or update submission
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

        const { lessonId, submissionId, text, fileUrl, action } = body;

        // Calculate word count
        const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

        // If creating or saving a draft
        if ((action === 'save' || action === 'create') && lessonId) {
            // Check for existing draft
            const { data: existingSubmission } = await supabase
                .from('submissions')
                .select('id')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonId)
                .eq('status', 'DRAFT')
                .single();

            if (existingSubmission) {
                // Update existing draft
                const { data: updated, error: updateError } = await supabase
                    .from('submissions')
                    .update({
                        text,
                        file_url: fileUrl,
                        word_count: wordCount,
                        last_saved_at: new Date().toISOString(),
                    })
                    .eq('id', existingSubmission.id)
                    .select()
                    .single();

                if (updateError) {
                    console.error('Error updating submission:', updateError);
                    return NextResponse.json(
                        { error: 'Failed to save submission' },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    submission: updated,
                    message: 'Draft saved',
                });
            }

            // Create new draft
            const { data: newSubmission, error: createError } = await supabase
                .from('submissions')
                .insert({
                    user_id: user.id,
                    lesson_id: lessonId,
                    text,
                    file_url: fileUrl,
                    word_count: wordCount,
                    status: 'DRAFT',
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating submission:', createError);
                return NextResponse.json(
                    { error: 'Failed to create submission' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                submission: newSubmission,
                message: 'Draft created',
            });
        }

        // If submitting for review
        if (action === 'submit' && (submissionId || lessonId)) {
            let targetId = submissionId;

            // If no submissionId, find the draft
            if (!targetId && lessonId) {
                const { data: draft } = await supabase
                    .from('submissions')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('lesson_id', lessonId)
                    .eq('status', 'DRAFT')
                    .single();

                if (!draft) {
                    return NextResponse.json(
                        { error: 'No draft found to submit' },
                        { status: 404 }
                    );
                }
                targetId = draft.id;
            }

            const { data: submitted, error: submitError } = await supabase
                .from('submissions')
                .update({
                    text,
                    file_url: fileUrl,
                    word_count: wordCount,
                    status: 'PENDING',
                    submitted_at: new Date().toISOString(),
                    last_saved_at: new Date().toISOString(),
                })
                .eq('id', targetId)
                .eq('user_id', user.id)
                .select()
                .single();

            if (submitError) {
                console.error('Error submitting:', submitError);
                return NextResponse.json(
                    { error: 'Failed to submit' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                submission: submitted,
                message: 'Submission sent for review',
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH: Instructor review submission
export async function PATCH(request: Request) {
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

        // Check if user is instructor/admin
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: Instructor access required' },
                { status: 403 }
            );
        }

        const { submissionId, score, feedback, feedbackAudioUrl } = body;

        if (!submissionId) {
            return NextResponse.json(
                { error: 'submissionId is required' },
                { status: 400 }
            );
        }

        const { data: reviewed, error: reviewError } = await supabase
            .from('submissions')
            .update({
                score,
                feedback,
                feedback_audio_url: feedbackAudioUrl,
                status: 'REVIEWED',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', submissionId)
            .select()
            .single();

        if (reviewError) {
            console.error('Error reviewing submission:', reviewError);
            return NextResponse.json(
                { error: 'Failed to review submission' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            submission: reviewed,
            message: 'Review submitted',
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
