import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function POST(
    request: Request
) {
    try {
        const supabase = createServerClient();
        const { attemptId, responses } = await request.json();

        // responses should be an array of { question_id, content, file_url }
        if (!attemptId || !responses) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        // Check if attempt is still in_progress
        const { data: attempt } = await supabase
            .from('attempts')
            .select('status, end_time')
            .eq('id', attemptId)
            .single();

        if (!attempt || attempt.status !== 'in_progress') {
            return NextResponse.json({ error: 'Tentative non active' }, { status: 403 });
        }

        // Check if time expired
        if (attempt.end_time && new Date() > new Date(attempt.end_time)) {
            return NextResponse.json({ error: 'Temps écoulé' }, { status: 403 });
        }

        // Batch upsert responses
        const upsertData = responses.map((resp: any) => ({
            attempt_id: attemptId,
            question_id: resp.question_id,
            content: resp.content,
            file_url: resp.file_url,
            updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase
            .from('responses')
            .upsert(upsertData, { onConflict: 'attempt_id,question_id' });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
