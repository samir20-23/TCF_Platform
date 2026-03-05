import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/attempt/start
 * Atomic start-attempt: checks subscription, decrements remaining_attempts, creates attempt.
 *
 * Body: { testId: string, subscriptionId: string, accessId?: string }
 * Returns: { attemptId, questions[] } (questions without is_correct)
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { testId, subscriptionId, accessId } = body;

        if (!testId || !subscriptionId) {
            return NextResponse.json(
                { error: 'testId and subscriptionId are required' },
                { status: 400 }
            );
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
        }

        // 1. Verify subscription belongs to user and is active
        const { data: subscription, error: subErr } = await (admin
            .from('subscriptions')
            .select('id, user_id, status, end_at')
            .eq('id', subscriptionId)
            .eq('user_id', user.id)
            .single()) as any;

        if (subErr || !subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        if (subscription.status !== 'active') {
            return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 });
        }

        if (subscription.end_at && new Date(subscription.end_at) < new Date()) {
            return NextResponse.json({ error: 'Subscription has expired' }, { status: 403 });
        }

        // 2. Find matching sub_test_access with remaining_attempts > 0
        let accessQuery = admin
            .from('sub_test_access')
            .select(`
                id,
                remaining_attempts,
                plan_test_id,
                plan_tests!inner (
                    id,
                    test_id,
                    max_attempts
                )
            `)
            .eq('subscription_id', subscriptionId)
            .gt('remaining_attempts', 0);

        if (accessId) {
            accessQuery = accessQuery.eq('id', accessId);
        } else {
            accessQuery = accessQuery.filter('plan_tests.test_id', 'eq', testId);
        }

        const { data: access, error: accessErr } = await (accessQuery.maybeSingle()) as any;

        if (accessErr || !access) {
            return NextResponse.json(
                { error: 'No remaining attempts for this test with this subscription' },
                { status: 403 }
            );
        }

        // 3. Check for existing in-progress attempt
        const { data: existingAttempt } = await (admin
            .from('attempts')
            .select('id')
            .eq('user_id', user.id)
            .eq('test_id', testId)
            .eq('status', 'in_progress')
            .maybeSingle()) as any;

        if (existingAttempt) {
            // Resume existing attempt — fetch questions
            const { data: questions } = await (admin
                .from('questions')
                .select(`
          id,
          position,
          text,
          q_type,
          points,
          options (
            id,
            text
          )
        `)
                .eq('test_id', testId)
                .order('position', { ascending: true })) as any;

            return NextResponse.json({
                attemptId: existingAttempt.id,
                resumed: true,
                questions: questions || [],
            });
        }

        // 4. Atomic operation: decrement remaining_attempts + create attempt
        // Decrement remaining_attempts
        const { error: decrementErr } = await (admin
            .from('sub_test_access')
            .update({ remaining_attempts: access.remaining_attempts - 1, updated_at: new Date().toISOString() })
            .eq('id', access.id)
            .eq('remaining_attempts', access.remaining_attempts)) as any; // Optimistic locking

        if (decrementErr) {
            console.error('Failed to decrement remaining_attempts:', decrementErr);
            return NextResponse.json(
                { error: 'Failed to start attempt — please try again' },
                { status: 500 }
            );
        }

        // Create attempt
        const { data: newAttempt, error: createErr } = await (admin
            .from('attempts')
            .insert({
                user_id: user.id,
                test_id: testId,
                subscription_id: subscriptionId,
                started_at: new Date().toISOString(),
                status: 'in_progress',
            })
            .select('id')
            .single()) as any;

        if (createErr) {
            console.error('Failed to create attempt:', createErr);
            // Rollback: re-increment remaining_attempts
            await admin
                .from('sub_test_access')
                .update({ remaining_attempts: access.remaining_attempts } as any)
                .eq('id', access.id);

            return NextResponse.json(
                { error: 'Failed to create attempt' },
                { status: 500 }
            );
        }

        // 5. Fetch questions (without is_correct on options)
        const { data: questions } = await (admin
            .from('questions')
            .select(`
        id,
        position,
        text,
        q_type,
        points,
        options (
          id,
          text
        )
      `)
            .eq('test_id', testId)
            .order('position', { ascending: true })) as any;

        // 6. Log action
        await admin.from('actions').insert({
            actor_type: 'user',
            actor_id: user.id,
            action_type: 'attempt_started',
            target_type: 'attempt',
            target_id: (newAttempt as any).id,
            details: JSON.stringify({ testId, subscriptionId }),
        } as any);

        return NextResponse.json({
            attemptId: (newAttempt as any).id,
            resumed: false,
            questions: questions || [],
        });
    } catch (error) {
        console.error('Unexpected error in attempt/start:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
