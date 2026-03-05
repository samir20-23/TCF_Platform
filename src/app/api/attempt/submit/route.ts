import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/attempt/submit
 * Submit an attempt: save answers, auto-grade MCQ, flag writing/speaking as pending_review.
 *
 * Body: { attemptId: string, answers: Array<{ questionId, optionId?, textAnswer?, mediaUrl? }> }
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { attemptId, answers } = body;

        if (!attemptId || !answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'attemptId and answers[] are required' },
                { status: 400 }
            );
        }

        const admin = getAdminClient();

        // 1. Verify attempt belongs to user and is in_progress
        const { data: attempt, error: attemptErr } = await admin
            .from('attempts')
            .select('id, test_id, user_id, status')
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .single();

        if (attemptErr || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if (attempt.status !== 'in_progress') {
            return NextResponse.json(
                { error: 'Attempt is not in progress' },
                { status: 400 }
            );
        }

        // 2. Fetch questions with correct options
        const { data: questions } = await admin
            .from('questions')
            .select(`
        id,
        q_type,
        points,
        options (
          id,
          is_correct
        )
      `)
            .eq('test_id', attempt.test_id);

        if (!questions || questions.length === 0) {
            return NextResponse.json({ error: 'No questions found for this test' }, { status: 500 });
        }

        // 3. Upsert answers and auto-grade MCQ
        let totalScore = 0;
        let maxScore = 0;
        let hasManualReview = false;

        for (const answer of answers) {
            const question = questions.find((q: any) => q.id === answer.questionId);
            if (!question) continue;

            const points = question.points || 1;
            maxScore += points;

            // Upsert answer row
            await admin.from('answers').upsert({
                attempt_id: attemptId,
                question_id: answer.questionId,
                option_id: answer.optionId || null,
                text_answer: answer.textAnswer || null,
                media_url: answer.mediaUrl || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'attempt_id,question_id',
            });

            // Auto-grade MCQ
            if (question.q_type === 'mcq' && answer.optionId) {
                const correctOption = (question.options as any[])?.find((o: any) => o.is_correct === true);
                if (correctOption && correctOption.id === answer.optionId) {
                    totalScore += points;
                }
            } else if (question.q_type === 'writing' || question.q_type === 'speaking') {
                hasManualReview = true;
            }
        }

        // 4. Determine final status
        const finalStatus = hasManualReview ? 'pending_review' : 'finished';

        // 5. Update attempt
        const { data: updatedAttempt, error: updateErr } = await admin
            .from('attempts')
            .update({
                score: totalScore,
                status: finalStatus,
                finished_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', attemptId)
            .select('id, score, status, finished_at')
            .single();

        if (updateErr) {
            console.error('Failed to update attempt:', updateErr);
            return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 });
        }

        // 6. Log action
        await admin.from('actions').insert({
            actor_type: 'user',
            actor_id: user.id,
            action_type: 'attempt_submitted',
            target_type: 'attempt',
            target_id: attemptId,
            details: JSON.stringify({ score: totalScore, maxScore, status: finalStatus }),
        });

        return NextResponse.json({
            attempt: updatedAttempt,
            score: totalScore,
            maxScore,
            status: finalStatus,
            message: finalStatus === 'pending_review'
                ? 'Test soumis. Certaines réponses nécessitent une correction manuelle.'
                : 'Test terminé et corrigé automatiquement.',
        });
    } catch (error) {
        console.error('Unexpected error in attempt/submit:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
