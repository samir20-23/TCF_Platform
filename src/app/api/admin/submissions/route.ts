import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/submissions
 * Real schema: submission_reviews(id, attempt_id, question_id, q_type, content, media_url,
 *   word_count, reviewer_id, score, max_score, feedback, reviewed_at, created_at)
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

        if (!['admin', 'instructor'].includes(profile?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const filterType = searchParams.get('type');
        const filterStatus = searchParams.get('status');
        const filterTestId = searchParams.get('test_id');

        let query = supabase
            .from('submission_reviews')
            .select(`
                id,
                q_type,
                content,
                media_url,
                word_count,
                score_final,
                max_score,
                reviewer_comment,
                reviewed_at,
                created_at,
                attempt_id,
                question_id,
                reviewer_id
            `)
            .order('created_at', { ascending: false });

        if (filterType) query = (query as any).eq('q_type', filterType);
        if (filterStatus === 'pending') query = (query as any).is('reviewed_at', null);
        if (filterStatus === 'completed') query = (query as any).not('reviewed_at', 'is', null);

        const { data: submissions, error } = await query;
        if (error) throw error;

        if (!submissions || submissions.length === 0) {
            return NextResponse.json({ submissions: [] });
        }

        // Collect all IDs for bulk fetching
        const attemptIds = [...new Set(submissions.map(s => s.attempt_id))];
        const questionIds = [...new Set(submissions.map(s => s.question_id))];

        // Fetch all attempts related to these submissions
        const { data: attempts } = await supabase
            .from('attempts')
            .select('id, user_id, test_id')
            .in('id', attemptIds);

        const attemptMap = (attempts || []).reduce((acc: any, a) => ({ ...acc, [a.id]: a }), {});

        // Collect user IDs and test IDs from attempts
        const userIds = [...new Set((attempts || []).map(a => a.user_id))];
        const testIds = [...new Set((attempts || []).map(a => a.test_id))];

        // Fetch all users, tests, questions, and resources in bulk
        const [usersRes, testsRes, questionsRes, resourcesRes] = await Promise.all([
            supabase.from('users').select('id, name, email').in('id', userIds),
            supabase.from('tests').select('id, name').in('id', testIds),
            supabase.from('questions').select('id, prompt, title, metadata, extra_payload, resource_id').in('id', questionIds),
            supabase.from('resources').select('*')
        ]);

        const userMap = (usersRes.data || []).reduce((acc: any, u) => ({ ...acc, [u.id]: u }), {});
        const testMap = (testsRes.data || []).reduce((acc: any, t) => ({ ...acc, [t.id]: t }), {});
        const questionMap = (questionsRes.data || []).reduce((acc: any, q) => ({ ...acc, [q.id]: q }), {});
        const resourceMap = (resourcesRes.data || []).reduce((acc: any, r) => ({ ...acc, [r.id]: r }), {});

        const enriched = submissions.map(sub => {
            const attempt = attemptMap[sub.attempt_id];
            const student = attempt ? userMap[attempt.user_id] : null;
            const test = attempt ? testMap[attempt.test_id] : null;
            const question = questionMap[sub.question_id];
            const resource = question?.resource_id ? resourceMap[question.resource_id] : null;

            if (filterTestId && (!attempt || attempt.test_id !== filterTestId)) return null;

            const meta = question?.metadata || question?.extra_payload || {};

            return {
                ...sub,
                score: sub.score_final,
                feedback: sub.reviewer_comment,
                isPending: !sub.reviewed_at,
                studentName: student?.name || student?.email || 'Étudiant inconnu',
                studentEmail: student?.email || '',
                testName: test?.name || 'Test inconnu',
                questionText: question?.prompt || question?.title || 'Question sans texte',
                rubric: meta?.rubric || '',
                sampleAnswer: meta?.sample_answer || '',
                resource: resource,
            };
        }).filter(Boolean);

        return NextResponse.json({ submissions: enriched });
    } catch (error: any) {
        console.error('Admin submissions GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
