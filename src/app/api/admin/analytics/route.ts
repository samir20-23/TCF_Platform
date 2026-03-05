import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30'; // days

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Get user statistics
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const { count: activeUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Actif');

        // Get enrollment statistics
        const { count: totalEnrollments } = await supabase
            .from('user_course_enrollments')
            .select('*', { count: 'exact', head: true });

        // Get test attempt statistics
        const { count: totalAttempts } = await supabase
            .from('test_attempts')
            .select('*', { count: 'exact', head: true });

        const { data: recentAttempts } = await supabase
            .from('test_attempts')
            .select('created_at, score, percentage')
            .gte('started_at', startDate.toISOString())
            .order('started_at', { ascending: false })
            .limit(100);

        // Get submission statistics
        const { count: pendingSubmissions } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'PENDING');

        // Get subscription statistics
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('subscription_type, created_at')
            .eq('is_active', true);

        // Calculate revenue (if payment_history table exists)
        const { data: payments } = await supabase
            .from('payment_history')
            .select('amount, payment_status, payment_date')
            .eq('payment_status', 'completed')
            .gte('payment_date', startDate.toISOString());

        const revenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

        // Calculate average scores
        const avgScore = recentAttempts && recentAttempts.length > 0
            ? recentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / recentAttempts.length
            : 0;

        return NextResponse.json({
            users: {
                total: totalUsers || 0,
                active: activeUsers || 0,
            },
            enrollments: {
                total: totalEnrollments || 0,
            },
            tests: {
                totalAttempts: totalAttempts || 0,
                recentAttempts: recentAttempts?.length || 0,
                averageScore: Math.round(avgScore * 100) / 100,
            },
            submissions: {
                pending: pendingSubmissions || 0,
            },
            subscriptions: {
                total: subscriptions?.length || 0,
                byType: subscriptions?.reduce((acc, s) => {
                    const type = s.subscription_type;
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>) || {},
            },
            revenue: {
                period: `last_${period}_days`,
                total: revenue,
                currency: 'CAD',
            },
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
