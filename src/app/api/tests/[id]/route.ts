import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: testId } = await params;
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userData?.role === 'admin';

        if (!isAdmin) {
            // Ensure the current user has an active subscription that grants access
            const { data: subs } = await supabase
                .from('subscriptions')
                .select('id, status, end_at')
                .eq('user_id', user.id)
                .eq('status', 'active');

            const now = new Date();
            const activeSubIds = (subs || [])
                .filter((s: any) => !s.end_at || new Date(s.end_at) > now)
                .map((s: any) => s.id);

            if (activeSubIds.length === 0) {
                return NextResponse.json({ error: 'No active subscription' }, { status: 403 });
            }

            const { data: accessRows } = await supabase
                .from('sub_test_access')
                .select(`
                    id,
                    remaining_attempts,
                    subscription_id,
                    plan_tests (
                        test_id
                    )
                `)
                .in('subscription_id', activeSubIds)
                .gt('remaining_attempts', 0);

            const hasAccess = (accessRows || []).some((row: any) => row.plan_tests?.test_id === testId);

            if (!hasAccess) {
                return NextResponse.json({ error: 'No access to this test' }, { status: 403 });
            }
        }

        const { data: test, error: testErr } = await supabase
            .from('tests')
            .select('*')
            .eq('id', testId)
            .single();

        if (testErr || !test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        // Fetch questions — NEVER expose is_correct to students at this stage
        const { data: questions } = await supabase
            .from('questions')
            .select('id, order_index, prompt, type, points, is_required, title, metadata, time_limit_seconds')
            .eq('test_id', testId)
            .order('order_index', { ascending: true });

        const questionIds = (questions || []).map((q: any) => q.id);

        let options: any[] = [];
        if (questionIds.length > 0) {
            const { data: opts } = await supabase
                .from('question_options')
                .select('id, question_id, option_text, order_index, pair_id')
                // is_correct intentionally excluded for students
                .in('question_id', questionIds);
            options = opts || [];
        }

        // Fetch resources — transcript included for audio/video accessibility
        const { data: resources } = await supabase
            .from('resources')
            .select('id, title, resource_type, url, description, transcript, question_id, order_index')
            .eq('test_id', testId)
            .eq('published', true)
            .order('order_index', { ascending: true });

        const questionsWithOptions = (questions || []).map((q: any) => ({
            ...q,
            options: options
                .filter((o: any) => o.question_id === q.id)
                .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
        }));

        return NextResponse.json({
            test,
            questions: questionsWithOptions,
            resources: resources || [],
        });
    } catch (error: any) {
        console.error('Test fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
