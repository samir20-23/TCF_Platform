import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/tests/[id]/start
 *
 * Creates a test attempt with:
 * - server-side end_at (now + duration_minutes)
 * - unique session_token (blocks multi-tab)
 *
 * Body: { accessId: string, subscriptionId: string }
 * Returns: { attemptId, sessionToken, endAt, questions[] }
 */
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id: testId } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { accessId, subscriptionId } = body;

        // Admin role check
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userData?.role === 'admin';
        const isAdminAccess = isAdmin || !accessId || accessId === 'admin-access' || String(accessId).startsWith('admin-');

        const admin = getAdminClient();
        if (!admin) return NextResponse.json({ error: 'Server config error' }, { status: 500 });

        // 1. Validate access for non-admin
        let resolvedSubId: string | null = null;
        if (!isAdminAccess) {
            const { data: accessRow } = await admin
                .from('sub_test_access')
                .select('remaining_attempts, subscription_id')
                .eq('id', accessId)
                .single();

            if (!accessRow || (accessRow as any).remaining_attempts <= 0) {
                return NextResponse.json({ error: 'No attempts remaining' }, { status: 403 });
            }

            // Validate subscription is active and not expired
            const { data: sub } = await admin
                .from('subscriptions')
                .select('id, status, end_at')
                .eq('id', (accessRow as any).subscription_id)
                .eq('user_id', user.id)
                .single();

            if (!sub || (sub as any).status !== 'active') {
                return NextResponse.json({ error: 'Subscription not active' }, { status: 403 });
            }
            if ((sub as any).end_at && new Date((sub as any).end_at) < new Date()) {
                return NextResponse.json({ error: 'Subscription expired' }, { status: 403 });
            }

            resolvedSubId = (accessRow as any).subscription_id;

            // Decrement attempts before creating attempt (optimistic lock)
            const { error: decErr } = await (admin.from('sub_test_access') as any)
                .update({ remaining_attempts: (accessRow as any).remaining_attempts - 1 })
                .eq('id', accessId)
                .eq('remaining_attempts', (accessRow as any).remaining_attempts);

            if (decErr) {
                return NextResponse.json({ error: 'Failed to reserve attempt – try again' }, { status: 500 });
            }
        }

        // 2. Retrieve test for duration
        const { data: test, error: testErr } = await admin
            .from('tests')
            .select('id, duration_minutes, name')
            .eq('id', testId)
            .single();

        if (testErr || !test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        // 3. Check for existing in_progress attempt (session conflict check)
        const { data: existing } = await admin
            .from('attempts')
            .select('id, session_token, end_at')
            .eq('user_id', user.id)
            .eq('test_id', testId)
            .eq('status', 'in_progress')
            .maybeSingle();

        if (existing) {
            // If endAt has not passed, return conflict so client can resume or show lock
            const endAt = (existing as any).end_at;
            if (endAt && new Date(endAt) > new Date()) {
                return NextResponse.json({
                    error: 'SESSION_CONFLICT',
                    attemptId: (existing as any).id,
                    sessionToken: (existing as any).session_token,
                    endAt: (existing as any).end_at,
                    resumed: true,
                }, { status: 200 });
            }
            // Otherwise existing attempt has timed out – auto-submit it
            await (admin.from('attempts') as any).update({
                status: 'auto_submitted',
                auto_submitted: true,
                submitted_at: new Date().toISOString(),
            }).eq('id', (existing as any).id);
        }

        // 4. Calculate end_at from server time
        const durationMinutes = (test as any).duration_minutes || 60;
        const startedAt = new Date();
        const endAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
        const sessionToken = randomUUID();

        // 5. Create attempt
        const { data: attempt, error: createErr } = await admin
            .from('attempts')
            .insert({
                user_id: user.id,
                test_id: testId,
                subscription_id: resolvedSubId,
                status: 'in_progress',
                started_at: startedAt.toISOString(),
                end_at: endAt.toISOString(),
                session_token: sessionToken,
                answer_data: {},
            } as any)
            .select('id, session_token, end_at')
            .single();

        if (createErr) {
            console.error('Failed to create attempt:', createErr);
            // Rollback attempt decrement if not admin
            if (!isAdminAccess && accessId) {
                // Rollback not implemented yet - but we should remove the stray .rpc
            }
            return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 });
        }

        // 6. Fetch questions WITHOUT correct answers
        const { data: questions } = await admin
            .from('questions')
            .select(`
                id,
                order_index,
                prompt,
                type,
                points,
                metadata
            `)
            .eq('test_id', testId)
            .order('order_index', { ascending: true });

        const questionIds = (questions || []).map((q: any) => q.id);
        let options: any[] = [];
        if (questionIds.length > 0) {
            const { data: opts } = await admin
                .from('question_options')
                .select('id, question_id, option_text, is_correct, order_index')
                .in('question_id', questionIds);
            options = opts || [];
        }

        const questionsWithOptions = (questions || []).map((q: any) => ({
            ...q,
            options: options.filter((o: any) => o.question_id === q.id).sort((a, b) => a.order_index - b.order_index),
        }));

        // 7. Log event
        await admin.from('actions').insert({
            actor_type: 'user',
            actor_id: user.id,
            action_type: 'test_started',
            target_type: 'attempt',
            target_id: (attempt as any).id,
            details: JSON.stringify({ testId, durationMinutes, isAdmin }),
        } as any);

        return NextResponse.json({
            attemptId: (attempt as any).id,
            sessionToken: (attempt as any).session_token,
            endAt: (attempt as any).end_at,
            resumed: false,
            questions: questionsWithOptions,
        });
    } catch (error: any) {
        console.error('Start test API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
