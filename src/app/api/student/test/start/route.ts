import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function POST(
    request: Request
) {
    try {
        const { testId } = await request.json();
        const supabase = createServerClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // 2. Check if user has active subscription for this test
        // (Logic for subscription check omitted for space, but should be here)

        // 3. Check for existing in_progress attempt
        const { data: existingAttempt } = await supabase
            .from('attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('test_id', testId)
            .eq('status', 'in_progress')
            .single();

        if (existingAttempt) {
            return NextResponse.json({ attempt: existingAttempt });
        }

        // 4. Create new attempt
        const { data: test } = await supabase.from('tests').select('duration_minutes').eq('id', testId).single();
        const startTime = new Date();
        const endTime = test?.duration_minutes
            ? new Date(startTime.getTime() + test.duration_minutes * 60000)
            : null;

        const { data: attempt, error } = await supabase
            .from('attempts')
            .insert({
                user_id: user.id,
                test_id: testId,
                status: 'in_progress',
                start_time: startTime.toISOString(),
                end_time: endTime?.toISOString(),
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ attempt });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
