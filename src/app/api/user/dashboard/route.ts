import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({
                profile: { id: user.id, email: user.email, name: user.email?.split('@')[0] || 'Utilisateur', role: 'student' },
                stats: { completed_tests_count: 0 },
                subscription: null,
                recentAttempts: []
            });
        }

        const { data: allAttempts } = await supabase
            .from('attempts')
            .select('status, score, score_total, created_at')
            .eq('user_id', user.id);

        const finishedAttempts = allAttempts?.filter(a => ['finished', 'completed', 'submitted', 'pending_review', 'auto_submitted'].includes(a.status)) || [];

        // 1. Total Points (Sum of actual scores)
        const totalPoints = finishedAttempts.reduce((sum: number, a: any) => sum + (Number(a.score) || 0), 0);

        // 2. Progression % (Total aggregate score / Total max points * 100)
        let overallProgress = 0;
        if (finishedAttempts.length > 0) {
            const sumScore = finishedAttempts.reduce((sum: number, a: any) => sum + (Number(a.score) || 0), 0);
            const sumMax = finishedAttempts.reduce((sum: number, a: any) => sum + (Number(a.score_total) || 0), 0);
            overallProgress = sumMax > 0 ? Math.floor((sumScore / sumMax) * 100) : 0;
        }

        // 3. Series Days (Days since EARLIEST active subscription started)
        let subscriptions: any[] = [];
        let seriesDaysUsed = 0;

        const { data: subsData } = await supabase
            .from('subscriptions')
            .select('*, plans(*)')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: true });

        if (subsData && subsData.length > 0) {
            const now = new Date();
            const earliestStart = new Date(subsData[0].created_at);

            const diffTime = Math.abs(now.getTime() - earliestStart.getTime());
            seriesDaysUsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            subscriptions = subsData.map(s => {
                const endAt = s.end_at ? new Date(s.end_at) : null;
                const msDiff = endAt ? endAt.getTime() - now.getTime() : 0;
                const daysRemaining = endAt ? Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24))) : null;
                return {
                    ...s,
                    days_remaining: daysRemaining,
                    is_active: true
                };
            });
        }

        const isAdmin = profile?.role === 'admin';

        let testAccess: any[] = [];
        if (isAdmin) {
            const { data: allTests } = await supabase.from('tests').select('id, name, test_type, duration_minutes, level, description, published').eq('published', true);
            testAccess = (allTests || []).map(t => ({
                id: `admin-${t.id}`,
                remaining_attempts: 999,
                plan_tests: { tests: t }
            }));
        } else if (subscriptions.length > 0) {
            const subIds = subscriptions.map(s => s.id);
            const { data: saData } = await supabase
                .from('sub_test_access')
                .select('id, remaining_attempts, test_id, tests(*)')
                .in('subscription_id', subIds);

            // Deduplicate tests by test_id
            const uniqueTests = new Map();
            (saData || []).forEach((row: any) => {
                if (row.tests && !uniqueTests.has(row.test_id)) {
                    uniqueTests.set(row.test_id, {
                        id: row.id,
                        remaining_attempts: row.remaining_attempts,
                        plan_tests: { tests: row.tests }
                    });
                }
            });
            testAccess = Array.from(uniqueTests.values());
        }

        const { data: recentAttempts } = await supabase
            .from('attempts')
            .select('*, tests(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        // 4. Performance data for chart
        const performanceData = finishedAttempts
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(a => ({
                date: new Date(a.created_at).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' }),
                score: a.score_total > 0 ? Math.round((a.score / a.score_total) * 100) : 0
            }));

        // 5. Target Level (Objective)
        const targetLevel = profile?.target_level || 'B2';

        return NextResponse.json({
            profile,
            stats: {
                completed_tests_count: finishedAttempts.length,
                current_streak_days: profile.current_streak_days || 0,
                points: totalPoints,
                overall_progress: overallProgress,
                series_days: seriesDaysUsed,
                target_level: targetLevel
            },
            subscriptions,
            subscription: subscriptions[0] || null, // Compatibility for legacy UI
            recentAttempts,
            performanceData,
            testAccess
        });


    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}