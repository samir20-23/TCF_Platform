import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/attempts/[id]/force-submit
 * Forces an in-progress attempt to be marked as submitted/completed.
 * This is server-authoritative and writes an audit log.
 */
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id: attemptId } = await params;

        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createServerClient();

        // Verify admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get the attempt to validate it exists and is in-progress
        const { data: attempt, error: fetchErr } = await supabase
            .from('attempts')
            .select('id, status, test_id, user_id')
            .eq('id', attemptId)
            .single();

        if (fetchErr || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if (attempt.status === 'completed') {
            return NextResponse.json({ error: 'Attempt is already completed' }, { status: 400 });
        }

        // Check if this test has manual correction questions
        const { data: pendingReviews } = await supabase
            .from('submission_reviews')
            .select('id, reviewed_at')
            .eq('attempt_id', attemptId)
            .is('reviewed_at', null);

        const newStatus = (pendingReviews && pendingReviews.length > 0) ? 'pending_review' : 'submitted';

        // Force-submit the attempt
        const now = new Date().toISOString();
        const { error: updateErr } = await supabase
            .from('attempts')
            .update({
                status: newStatus,
                finished_at: now,
            } as any)
            .eq('id', attemptId);

        if (updateErr) throw updateErr;

        // Write audit log (non-fatal)
        await supabase.from('admin_audit_logs').insert({
            admin_id: user.id,
            action: 'attempt_force_submitted',
            target_type: 'attempt',
            target_id: attemptId,
            details: {
                previousStatus: attempt.status,
                newStatus,
                userId: attempt.user_id,
                testId: attempt.test_id,
            }
        } as any).then(() => { });

        return NextResponse.json({
            success: true,
            status: newStatus,
            message: `Attempt force-submitted. Status: ${newStatus}`,
        });
    } catch (error: any) {
        console.error('Force-submit error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
