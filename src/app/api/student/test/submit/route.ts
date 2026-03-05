import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function POST(
    request: Request
) {
    try {
        const supabase = createServerClient();
        const { attemptId } = await request.json();

        if (!attemptId) {
            return NextResponse.json({ error: 'ID de tentative manquant' }, { status: 400 });
        }

        // 1. Get attempt and all responses
        const { data: attempt } = await supabase
            .from('attempts')
            .select('*, tests(*)')
            .eq('id', attemptId)
            .single();

        if (!attempt || attempt.status !== 'in_progress') {
            return NextResponse.json({ error: 'Tentative non active' }, { status: 403 });
        }

        const { data: responses } = await supabase
            .from('responses')
            .select('*, questions(*, question_options(*))')
            .eq('attempt_id', attemptId);

        const { data: questions } = await supabase
            .from('questions')
            .select('*, question_options(*)')
            .eq('test_id', attempt.test_id);

        // 2. Auto-grading logic
        let totalScore = 0;
        let needsManualReview = false;

        const gradedResponses = questions?.map((q: any) => {
            const resp = responses?.find((r: any) => r.question_id === q.id);
            let isCorrect = false;
            let scoreAwarded = 0;

            if (['singleChoice', 'multipleChoice', 'trueFalse'].includes(q.type)) {
                // Auto-grade logic
                const correctOptionIds = q.question_options
                    .filter((opt: any) => opt.is_correct)
                    .map((opt: any) => opt.id);

                const studentOptionIds = resp?.content?.selectedOptionIds || [];

                // Simple exact match check
                const isMatch = correctOptionIds.length === studentOptionIds.length &&
                    correctOptionIds.every((id: string) => studentOptionIds.includes(id));

                if (isMatch) {
                    isCorrect = true;
                    scoreAwarded = q.points;
                }
            } else if (['matching', 'ordering'].includes(q.type)) {
                // Complex auto-grade logic (simplified here)
                needsManualReview = true;
            } else {
                // Open-ended questions always need manual review
                needsManualReview = true;
            }

            return {
                id: resp?.id,
                attempt_id: attemptId,
                question_id: q.id,
                is_correct: isCorrect,
                score_awarded: scoreAwarded,
                status: needsManualReview ? 'pending' : 'graded'
            };
        }) || [];

        totalScore = gradedResponses.reduce((sum, r) => sum + r.score_awarded, 0);

        // 3. Update status and score
        const finalStatus = needsManualReview ? 'pending_review' : 'completed';
        const { error: updateError } = await supabase
            .from('attempts')
            .update({
                status: finalStatus,
                end_time: new Date().toISOString(),
                score_total: totalScore,
            })
            .eq('id', attemptId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            status: finalStatus,
            score: totalScore
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
