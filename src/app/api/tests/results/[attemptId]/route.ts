import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    try {
        const { attemptId } = await params;
        if (!attemptId) return NextResponse.json({ error: 'ID de tentative manquant' }, { status: 400 });

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch attempt details
        const { data: attempt, error: attemptErr } = await supabase
            .from('attempts')
            .select(`
                *,
                tests ( id, name, test_type, duration_minutes )
            `)
            .eq('id', attemptId)
            .single();

        if (attemptErr || !attempt) {
            console.error('Attempt fetch err:', attemptErr);
            return NextResponse.json({ error: 'Tentative introuvable' }, { status: 404 });
        }

        // Verify ownership or system admin
        const isAdmin = (await supabase.from('users').select('role').eq('id', user.id).single()).data?.role === 'admin';
        if (attempt.user_id !== user.id && !isAdmin) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Fetch reviews for that attempt
        const { data: reviews, error: revErr } = await supabase
            .from('submission_reviews')
            .select('id, q_type, score_final, max_score, reviewer_comment, content')
            .eq('attempt_id', attemptId);

        // Map column differences just in case
        const mappedReviews = (reviews || []).map(r => ({
            ...r,
            score: r.score_final,
            feedback: r.reviewer_comment
        }));

        return NextResponse.json({ attempt, reviews: mappedReviews });

    } catch (error: any) {
        console.error('Results API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
