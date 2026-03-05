import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/attempts
 * List all attempts with optional filters: status, search, page, limit
 * Real schema: attempts(id, user_id, test_id, status, started_at, finished_at, score, subscription_id)
 */
export async function GET(request: Request) {
    try {
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createServerClient();

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const offset = (page - 1) * limit;

        // If search is provided, find matching user IDs first
        let userIdFilter: string[] | null = null;
        if (search) {
            const { data: matchingUsers } = await supabase
                .from('users')
                .select('id')
                .or(`name.ilike.%${search}%,email.ilike.%${search}%`);

            if (!matchingUsers || matchingUsers.length === 0) {
                return NextResponse.json({ attempts: [], total: 0 });
            }
            userIdFilter = matchingUsers.map((u: any) => u.id);
        }

        let query = supabase
            .from('attempts')
            .select(`
                id,
                status,
                created_at,
                finished_at,
                score,
                score_total,
                user_id,
                test_id,
                subscription_id
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (statusFilter) {
            query = query.eq('status', statusFilter) as any;
        }

        if (userIdFilter) {
            query = query.in('user_id', userIdFilter) as any;
        }

        const { data: attempts, error, count } = await query;

        if (error) throw error;

        // Manually enrich with users and tests to avoid PostgREST foreign key 500 errors
        const userIds = [...new Set((attempts || []).map(a => a.user_id))];
        const testIds = [...new Set((attempts || []).map(a => a.test_id))];

        const { data: usersData } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds);

        const { data: testsData } = await supabase
            .from('tests')
            .select('id, name')
            .in('id', testIds);

        const usersMap = (usersData || []).reduce((acc: any, u: any) => ({ ...acc, [u.id]: u }), {});
        const testsMap = (testsData || []).reduce((acc: any, t: any) => ({ ...acc, [t.id]: t }), {});

        const enrichedAttempts = (attempts || []).map(a => ({
            ...a,
            users: usersMap[a.user_id] || { name: 'Inconnu', email: '' },
            tests: testsMap[a.test_id] || { name: 'Inconnu' }
        }));

        return NextResponse.json({
            attempts: enrichedAttempts,
            total: count || 0,
            page,
            limit,
        });
    } catch (error: any) {
        console.error('Admin GET attempts error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
