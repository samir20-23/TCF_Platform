import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const adminSupabase = getAdminClient();
        if (!adminSupabase) return NextResponse.json({ error: 'Server error' }, { status: 500 });

        const { data: plan, error } = await adminSupabase
            .from('plans')
            .update({
                name: body.name,
                description: body.description,
                price_cents: body.price_cents,
                duration_days: body.duration_days,
                currency: body.currency,
                features: body.features,
                is_popular: body.is_popular,
                active: body.active,
                published: body.published,
                attempts_allowed: body.attempts_allowed,
                allowed_tests_tags: body.allowed_tests_tags,
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Optionally update linked tests
        if (body.test_ids && Array.isArray(body.test_ids)) {
            // Remove old links
            await adminSupabase.from('plan_tests').delete().eq('plan_id', id);

            if (body.test_ids.length > 0) {
                const testLinks = body.test_ids.map((testId: string) => ({
                    plan_id: id,
                    test_id: testId,
                    max_attempts: 5
                }));
                const { error: linkError } = await adminSupabase
                    .from('plan_tests')
                    .insert(testLinks);

                if (linkError) console.error("Failed to link tests to updated plan", linkError);
            }
        }

        return NextResponse.json({ plan });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const adminSupabase = getAdminClient();

        // Optional: Pre-check if references exist (e.g. subscriptions)
        const { count } = await adminSupabase
            .from('subscriptions')
            .select('id', { count: 'exact', head: true })
            .eq('plan_id', id);

        if (count && count > 0) {
            // Instead of deleting, archive it
            await adminSupabase.from('plans').update({ active: false } as any).eq('id', id);
            return NextResponse.json({ message: 'Plan referenced by subscriptions, archived instead of deleted' });
        }

        const { error } = await adminSupabase
            .from('plans')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
