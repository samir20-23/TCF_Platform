import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/attempts/[id]/reset
 * Resets an attempt: deletes answers, restores remaining_attempts, sets status to null.
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

        // Fetch the attempt to get sub_test_access info
        const { data: attempt, error: fetchErr } = await supabase
            .from('attempts')
            .select('id, status, test_id, user_id, subscription_id')
            .eq('id', attemptId)
            .single();

        if (fetchErr || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        const previousStatus = attempt.status;

        // 1. Delete all answers for this attempt
        await supabase.from('answers').delete().eq('attempt_id', attemptId);

        // 2. Delete submission_reviews for this attempt
        await supabase.from('submission_reviews').delete().eq('attempt_id', attemptId);

        // 3. Delete the attempt itself
        const { error: deleteErr } = await supabase
            .from('attempts')
            .delete()
            .eq('id', attemptId);

        if (deleteErr) throw deleteErr;

        // 4. Restore remaining_attempts on sub_test_access
        const { data: accessRow } = await supabase
            .from('sub_test_access')
            .select('id, remaining_attempts, max_attempts')
            .eq('subscription_id', attempt.subscription_id || '')
            .eq('test_id', attempt.test_id)
            .maybeSingle();

        if (accessRow) {
            const restoredRemaining = Math.min(
                (accessRow.remaining_attempts || 0) + 1,
                accessRow.max_attempts || 99
            );
            await supabase
                .from('sub_test_access')
                .update({ remaining_attempts: restoredRemaining })
                .eq('id', accessRow.id);
        }

        // 5. Write audit log (non-fatal)
        await supabase.from('admin_audit_logs').insert({
            admin_id: user.id,
            action: 'attempt_reset',
            target_type: 'attempt',
            target_id: attemptId,
            details: {
                previousStatus,
                userId: attempt.user_id,
                testId: attempt.test_id,
                remainingAttemptsRestored: !!accessRow,
            }
        } as any).then(() => { });

        return NextResponse.json({
            success: true,
            message: 'Attempt reset. Answers deleted and access restored.',
        });
    } catch (error: any) {
        console.error('Reset attempt error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
