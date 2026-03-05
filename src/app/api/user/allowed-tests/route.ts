import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/allowed-tests
 * Returns the tests the authenticated user has access to with remaining_attempts.
 * Joins sub_test_access → plan_tests → tests for active subscriptions.
 */
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check user role first
        const { data: userData, error: userErr } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userErr) {
            console.error('Error fetching user role:', userErr);
            return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
        }

        const isAdmin = userData?.role === 'admin';

        // If admin, return all published tests with a special "admin" flag
        if (isAdmin) {
            const { data: allTests, error: allTestsErr } = await supabase
                .from('tests')
                .select('*, resources(*)')
                .eq('published', true);

            if (allTestsErr) {
                console.error('Error fetching all tests for admin:', allTestsErr);
                return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
            }

            const formattedTests = allTests.map((test: any) => ({
                accessId: `admin-${test.id}`,
                subscriptionId: 'admin-access',
                remainingAttempts: 999,
                maxAttempts: 999,
                manualCorrection: true,
                test: test,
                isExpired: false,
                role: 'admin'
            }));

            return NextResponse.json({ allowedTests: formattedTests, subscriptions: [], isAdmin: true });
        }

        // Get ALL subscriptions for the user (active or expired)
        const { data: subscriptions, error: subErr } = await supabase
            .from('subscriptions')
            .select('id, plan_id, status, start_at, end_at')
            .eq('user_id', user.id);

        if (subErr) {
            console.error('Error fetching subscriptions:', subErr);
            return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ allowedTests: [] });
        }

        // Get sub_test_access with plan_tests and tests for all active subscriptions
        const subIds = subscriptions.map((s: any) => s.id);

        const { data: accessRows, error: accessErr } = await supabase
            .from('sub_test_access')
            .select(`
        id,
        remaining_attempts,
        subscription_id,
        max_attempts,
        manual_correction,
        test:tests (
          id,
          name,
          test_type,
          duration_minutes,
          description,
          published,
          resources (
            id,
            title,
            resource_type,
            url,
            description,
            is_required,
            transcript,
            replay_limit,
            question_id
          )
        )
      `)
            .in('subscription_id', subIds);

        if (accessErr) {
            console.error('Error fetching allowed tests:', accessErr);
            return NextResponse.json({ error: 'Failed to fetch allowed tests' }, { status: 500 });
        }

        // Flatten and format, adding isExpired flag
        const now = new Date();
        const allowedTests = (accessRows || []).map((row: any) => {
            const sub = subscriptions.find((s: any) => s.id === row.subscription_id);
            const isExpired = sub?.status !== 'active' || (sub?.end_at && new Date(sub.end_at) < now);

            return {
                accessId: row.id,
                subscriptionId: row.subscription_id,
                remainingAttempts: row.remaining_attempts,
                maxAttempts: row.max_attempts,
                manualCorrection: row.manual_correction,
                test: row.test || null,
                isExpired: isExpired,
            };
        }).filter((t: any) => t.test !== null && t.test.published !== false);

        return NextResponse.json({ allowedTests, subscriptions });
    } catch (error) {
        console.error('Unexpected error in allowed-tests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
