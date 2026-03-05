import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/attempts — Fetch user's attempts (optionally filtered by testId/status)
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const testId = searchParams.get('testId');
        const status = searchParams.get('status');

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = supabase
            .from('attempts')
            .select(`
        id,
        test_id,
        subscription_id,
        started_at,
        finished_at,
        score,
        status,
        created_at
      `)
            .eq('user_id', user.id)
            .order('started_at', { ascending: false });

        if (testId) {
            query = query.eq('test_id', testId);
        }
        if (status) {
            query = query.eq('status', status);
        }

        const { data: attempts, error } = await query;
        if (error) {
            console.error('Error fetching attempts:', error);
            return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
        }

        return NextResponse.json({ attempts });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
