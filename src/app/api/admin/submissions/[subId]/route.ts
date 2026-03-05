import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

interface RouteParams {
    params: Promise<{ subId: string }>;
}

async function requireAdmin(supabase: any, userId: string) {
    const { data } = await supabase.from('users').select('role').eq('id', userId).single();
    return ['admin', 'instructor'].includes(data?.role);
}

/**
 * PATCH /api/admin/submissions/[subId]
 * Score a submission_review and optionally update the attempt final score.
 * Body: { score: number, feedback?: string }
 */
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { subId } = await params;
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!await requireAdmin(authClient, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const supabase = createServerClient();

        const body = await request.json();
        const { score, feedback } = body;

        if (score === undefined || typeof score !== 'number') {
            return NextResponse.json({ error: 'score (number) is required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        const { data: updated, error: updateErr } = await supabase
            .from('submission_reviews')
            .update({
                score_final: Number(score),
                reviewer_comment: feedback || null,
                reviewer_id: user.id,
                reviewed_at: now,
                status: 'reviewed',
            })
            .eq('id', subId)
            .select('id, attempt_id, score_final, max_score')
            .single();

        if (updateErr) throw updateErr;

        // Check if all submissions for this attempt are now scored
        const attemptId = (updated as any).attempt_id;
        const { data: allSubs } = await supabase
            .from('submission_reviews')
            .select('score_final, max_score, reviewed_at')
            .eq('attempt_id', attemptId);

        const allScored = (allSubs || []).every((s: any) => s.reviewed_at !== null);

        if (allScored) {
            // Compute manual review total
            const manualTotal = (allSubs || []).reduce((sum: number, s: any) => sum + (s.score_final || 0), 0);

            // Get auto-graded score from attempt
            const { data: attempt } = await supabase
                .from('attempts')
                .select('score_total')
                .eq('id', attemptId)
                .single();

            const autoScore = (attempt as any)?.score_total || 0;
            const finalScore = autoScore + manualTotal;

            await supabase.from('attempts').update({
                status: 'completed',
                score_total: finalScore,
            } as any).eq('id', attemptId);
        }

        // Write audit log (non-fatal)
        await supabase.from('admin_audit_logs').insert({
            admin_id: user.id,
            action: 'review_submitted',
            target_type: 'submission_review',
            target_id: subId,
            details: { score, feedback, allReviewsComplete: allScored }
        } as any).then(() => { });

        return NextResponse.json({
            updated: true,
            allReviewsComplete: allScored,
        });
    } catch (error: any) {
        console.error('Admin submission PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
