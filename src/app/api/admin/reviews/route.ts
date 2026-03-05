import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
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

        // Fetch attempts pending review
        const { data: attempts, error } = await supabase
            .from('attempts')
            .select(`
                id,
                status,
                start_time,
                finished_at,
                score_total,
                user_id,
                users:users(name, email),
                test_id,
                tests:tests(name, section_type)
            `)
            .eq('status', 'pending_review')
            .order('finished_at', { ascending: false });

        if (error) throw error;

        // Enrich with count of pending responses for each attempt
        const enriched = await Promise.all((attempts || []).map(async (attempt: any) => {
            const { count } = await supabase
                .from('responses')
                .select('*', { count: 'exact', head: true })
                .eq('attempt_id', attempt.id)
                .is('graded_at', null);

            return {
                ...attempt,
                pending_responses_count: count || 0
            };
        }));

        return NextResponse.json({ reviews: enriched });
    } catch (error: any) {
        console.error('Reviews API GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
