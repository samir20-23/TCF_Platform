import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Canonical type sets for grading
const SINGLE_CHOICE_TYPES = new Set(['mcq', 'single_choice', 'singleChoice', 'true_false', 'trueFalse', 'listening', 'reading']);
const MULTI_CHOICE_TYPES = new Set(['multi_select', 'multiple_choice', 'multipleChoice']);
const SHORT_TEXT_TYPES = new Set(['short_text', 'shortText']);
const MANUAL_REVIEW_TYPES = new Set(['writing', 'long_text', 'longText', 'speaking', 'audioRecording', 'expression_orale', 'file_upload', 'fileUpload']);
const MATCHING_TYPES = new Set(['matching', 'mise_en_correspondance']);
const ORDERING_TYPES = new Set(['ordering', 'ordonnancement']);

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id: testId } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { attemptId, sessionToken, answerData, autoSubmit = false } = body;

        if (!attemptId || typeof answerData !== 'object') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const admin = getAdminClient();
        if (!admin) return NextResponse.json({ error: 'Server config error' }, { status: 500 });

        // 1. Verify attempt
        const { data: attempt, error: attemptErr } = await admin
            .from('attempts')
            .select('id, user_id, status, session_token, end_at, test_id')
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (attemptErr || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if ((attempt as any).status !== 'in_progress') {
            return NextResponse.json({
                alreadySubmitted: true,
                status: (attempt as any).status,
            });
        }

        // 2. Session token check
        if (!autoSubmit && sessionToken && (attempt as any).session_token !== sessionToken) {
            return NextResponse.json(
                { error: 'SESSION_CONFLICT', message: 'Test is open in another tab' },
                { status: 401 }
            );
        }

        // 3. Fetch questions WITH correct answers (admin client only)
        const { data: questions } = await admin
            .from('questions')
            .select(`
                id,
                type,
                points,
                metadata,
                question_options (id, is_correct, option_text, order_index, pair_id)
            `)
            .eq('test_id', testId);

        let autoScore = 0;
        let maxScore = 0;
        let hasPendingReview = false;
        const submissionReviewRows: any[] = [];

        for (const q of (questions || []) as any[]) {
            const points = q.points || 1;
            maxScore += points;
            const studentAnswer = answerData?.[q.id];
            const qType: string = q.type || '';
            const qOptions: any[] = q.question_options || [];

            if (SINGLE_CHOICE_TYPES.has(qType)) {
                // Single correct option — student stores the option id
                const correctOption = qOptions.find((o: any) => o.is_correct === true);
                if (correctOption && studentAnswer === correctOption.id) {
                    autoScore += points;
                }

            } else if (MULTI_CHOICE_TYPES.has(qType)) {
                // Multiple correct options with proportional scoring
                const correctIds = new Set(qOptions.filter((o: any) => o.is_correct).map((o: any) => o.id));
                const selectedIds: string[] = Array.isArray(studentAnswer) ? studentAnswer : [];
                const numCorrectSelected = selectedIds.filter(id => correctIds.has(id)).length;
                if (correctIds.size > 0 && numCorrectSelected > 0) {
                    autoScore += Math.round(points * (numCorrectSelected / correctIds.size));
                }

            } else if (SHORT_TEXT_TYPES.has(qType)) {
                // Auto-grade if acceptable answers list is in options or metadata
                const correctOpts = qOptions.filter((o: any) => o.is_correct);
                const acceptable = correctOpts.length > 0
                    ? correctOpts.map((o: any) => (o.option_text || '').toLowerCase().trim())
                    : ((q.metadata?.acceptable_answers || []) as string[]).map(a => a.toLowerCase().trim());

                if (acceptable.length > 0 && typeof studentAnswer === 'string') {
                    const normalized = studentAnswer.trim().toLowerCase();
                    if (acceptable.includes(normalized)) {
                        autoScore += points;
                    }
                } else if (acceptable.length === 0) {
                    // No answers defined -> manual review
                    hasPendingReview = true;
                    submissionReviewRows.push({
                        attempt_id: attemptId,
                        question_id: q.id,
                        q_type: qType,
                        content: typeof studentAnswer === 'string' ? studentAnswer : null,
                        max_score: points,
                    });
                }

            } else if (MATCHING_TYPES.has(qType)) {
                // Auto-grade by pair — student answer: { leftId: rightId }
                const pairs = typeof studentAnswer === 'object' && !Array.isArray(studentAnswer) ? studentAnswer : {};
                const leftOpts = qOptions.filter((o: any) => o.pair_id?.startsWith('L'));
                const maxPairs = leftOpts.length;
                let correctPairs = 0;

                // Build correct mapping from pair_id: 'L1' matches to 'R1'
                for (const leftOpt of leftOpts) {
                    const pairNum = leftOpt.pair_id?.replace('L', '');
                    const correctRight = qOptions.find((o: any) => o.pair_id === `R${pairNum}`);
                    if (correctRight && pairs[leftOpt.id] === correctRight.id) {
                        correctPairs++;
                    }
                }
                if (maxPairs > 0) {
                    autoScore += Math.round(points * (correctPairs / maxPairs));
                }

            } else if (ORDERING_TYPES.has(qType)) {
                // Auto-grade by counting correctly positioned items
                const correctOrder = [...qOptions]
                    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                    .map((o: any) => o.id);
                const studentOrder: string[] = Array.isArray(studentAnswer) ? studentAnswer : [];
                const correctPositions = studentOrder.filter((id, i) => id === correctOrder[i]).length;
                if (correctOrder.length > 0) {
                    autoScore += Math.round(points * (correctPositions / correctOrder.length));
                }

            } else if (MANUAL_REVIEW_TYPES.has(qType)) {
                // Manual review required
                hasPendingReview = true;
                let content: string | null = null;
                let mediaUrl: string | null = null;
                let wordCount: number | null = null;

                if (typeof studentAnswer === 'string') {
                    content = studentAnswer;
                    wordCount = content.split(/\s+/).filter(Boolean).length;
                } else if (studentAnswer?.audioUrl) {
                    mediaUrl = studentAnswer.audioUrl;
                } else if (studentAnswer?.fileName) {
                    content = studentAnswer.fileName;
                }

                submissionReviewRows.push({
                    attempt_id: attemptId,
                    question_id: q.id,
                    q_type: qType,
                    content,
                    media_url: mediaUrl,
                    word_count: wordCount,
                    max_score: points,
                });
            }
        }

        // 4. Insert submission_reviews for manual grading
        if (submissionReviewRows.length > 0) {
            await (admin.from('submission_reviews') as any).upsert(submissionReviewRows as any, {
                onConflict: 'attempt_id,question_id',
            });
        }

        // 5. Update attempt
        const finalStatus = autoSubmit ? 'auto_submitted' : (hasPendingReview ? 'pending_review' : 'completed');
        const now = new Date().toISOString();

        await (admin.from('attempts') as any).update({
            status: finalStatus,
            auto_submitted: autoSubmit,
            answer_data: answerData,
            last_saved_at: now,
            submitted_at: now,
            score: autoScore,
            score_total: maxScore,
            finished_at: now,
        } as any).eq('id', attemptId);

        // 6. Log
        await admin.from('actions').insert({
            actor_type: 'user',
            actor_id: user.id,
            action_type: autoSubmit ? 'test_auto_submitted' : 'test_submitted',
            target_type: 'attempt',
            target_id: attemptId,
            details: JSON.stringify({ testId, score: autoScore, score_total: maxScore, hasPendingReview }),
        } as any);

        return NextResponse.json({
            success: true,
            score: autoScore,
            maxScore,
            hasPendingReview,
            status: finalStatus,
            message: hasPendingReview
                ? 'Test soumis. Score partiel affiché – correction manuelle en cours pour certaines parties.'
                : 'Test terminé et corrigé automatiquement.',
        });
    } catch (error: any) {
        console.error('Submit test API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
