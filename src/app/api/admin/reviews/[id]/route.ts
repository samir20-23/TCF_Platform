import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET: Fetch detailed info for a single attempt review
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: attemptId } = await params;
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createServerClient();

        // Check admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select(`
                *,
                users:users(name, email),
                tests:tests(name, section_type)
            `)
            .eq('id', attemptId)
            .single();

        if (attemptError) throw attemptError;

        const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select(`
                *,
                questions:questions(prompt, type, metadata, rubric)
            `)
            .eq('attempt_id', attemptId)
            .in('questions.type', ['speaking', 'longText', 'writing']);

        if (responsesError) throw responsesError;

        return NextResponse.json({
            attempt,
            responses: responses || []
        });
    } catch (error: any) {
        console.error('Review Detail API GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update score and feedback for a response or final attempt
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: attemptId } = await params;
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createServerClient();
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { responseId, score_awarded, feedback, finalStatus } = body;

        if (responseId) {
            // Update individual response
            const { error } = await supabase
                .from('responses')
                .update({
                    score_awarded,
                    feedback,
                    graded_by: user.id,
                    graded_at: new Date().toISOString()
                })
                .eq('id', responseId);

            if (error) throw error;
        }

        if (finalStatus) {
            // Update overall attempt status
            const { error } = await supabase
                .from('attempts')
                .update({
                    status: finalStatus,
                    score_total: body.score_total // If provided
                })
                .eq('id', attemptId);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Review PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
