import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Total Users
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // 2. Active Subscriptions
        const { count: activeSubscriptions } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // 3. Subscription Distribution
        const { data: subsData } = await supabase
            .from('subscriptions')
            .select('*, plans(name)')
            .eq('status', 'active');

        const subCounts: Record<string, number> = {};
        subsData?.forEach(s => {
            const planName = s.plans?.name || 'Inconnu';
            subCounts[planName] = (subCounts[planName] || 0) + 1;
        });

        // 4. Monthly Revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // 5. Recent Activity
        const { data: activities } = await supabase
            .from('actions')
            .select('*, users!actions_actor_id_fkey(name)')
            .order('created_at', { ascending: false })
            .limit(10);

        // 6. Popular Tests
        const { data: attempts } = await supabase
            .from('attempts')
            .select('test_id, tests(name)');

        const testStats: Record<string, any> = {};
        attempts?.forEach((a: any) => {
            if (!testStats[a.test_id]) {
                testStats[a.test_id] = { title: a.tests?.name || 'Test', count: 0 };
            }
            testStats[a.test_id].count++;
        });

        const popularTests = Object.values(testStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 7. Pending Manual Reviews (for speaking/writing)
        const { data: pendingAttempts } = await supabase
            .from('attempts')
            .select('id, created_at, users(name, email), tests(name)')
            .eq('status', 'pending_review')
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            metrics: {
                totalUsers: totalUsers || 0,
                activeSubscriptions: activeSubscriptions || 0,
                monthlyRevenue: Math.round(monthlyRevenue),
                completionRate: 0,
            },
            subscriptionDistribution: [
                { name: 'Basique', value: subCounts['Basique'] || 0, color: '#2C5282' },
                { name: 'Premium', value: subCounts['Premium'] || 0, color: '#c4a574' },
                { name: 'VIP', value: subCounts['VIP'] || 0, color: '#38A169' },
            ],
            activities: activities?.map(a => ({
                id: a.id,
                userName: a.users?.name,
                action: a.action_type,
                timestamp: a.created_at,
                status: 'active'
            })) || [],
            popularTests: popularTests,
            pendingSubmissions: pendingAttempts?.map(a => ({
                id: a.id,
                created_at: a.created_at,
                user_profiles: { full_name: a.users?.name, email: a.users?.email },
                lessons: { title: a.tests?.name }
            })) || []
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
