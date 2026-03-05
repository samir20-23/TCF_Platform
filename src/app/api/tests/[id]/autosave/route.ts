import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/tests/[id]/autosave
 *
 * Saves partial answers during an in-progress test.
 * Validates: auth, session_token, time not expired.
 *
 * Body: { attemptId: string, sessionToken: string, answerData: Record<string, any> }
 * Returns: { saved: true, lastSavedAt: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
    try {
        await params; // consume params (not needed for autosave but required by Next.js)

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { attemptId, sessionToken, answerData } = body;

        if (!attemptId || !sessionToken || typeof answerData !== 'object') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const admin = getAdminClient();
        if (!admin) return NextResponse.json({ error: 'Server config error' }, { status: 500 });

        // Verify attempt belongs to user and is in_progress
        const { data: attempt, error: fetchErr } = await admin
            .from('attempts')
            .select('id, user_id, status, session_token, end_at')
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (fetchErr || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if ((attempt as any).status !== 'in_progress') {
            return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
        }

        // Session token check (anti-multi-tab)
        if ((attempt as any).session_token !== sessionToken) {
            return NextResponse.json(
                { error: 'SESSION_CONFLICT', message: 'Test is open in another tab' },
                { status: 401 }
            );
        }

        // Time check (server-side anti-tampering)
        const endAt = (attempt as any).end_at;
        if (endAt && new Date(endAt) < new Date()) {
            // Timer expired: auto-submit the attempt
            const now = new Date().toISOString();
            await admin.from('attempts').update({
                status: 'auto_submitted',
                auto_submitted: true,
                answer_data: answerData,
                last_saved_at: now,
                submitted_at: now,
            } as any).eq('id', attemptId);

            return NextResponse.json({ error: 'TIME_EXPIRED', message: 'Test time has expired' }, { status: 410 });
        }

        // Save answer data
        const now = new Date().toISOString();
        const { error: updateErr } = await admin
            .from('attempts')
            .update({
                answer_data: answerData,
                last_saved_at: now,
            } as any)
            .eq('id', attemptId);

        if (updateErr) {
            console.error('Autosave failed:', updateErr);
            return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
        }

        return NextResponse.json({ saved: true, lastSavedAt: now });
    } catch (error: any) {
        console.error('Autosave error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
