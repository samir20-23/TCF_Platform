import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';


export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check if user is admin
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminSupabase = getAdminClient();

        if (!adminSupabase) throw new Error("Could not initialize admin client");

        const { data: plans, error } = await adminSupabase
            .from('plans')
            .select(`*, plan_tests(test_id)`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten the test_ids
        const plansWithTests = (plans as any[])?.map(p => ({
            ...p,
            test_ids: p.plan_tests?.map((pt: any) => pt.test_id) || [],
            plan_tests: undefined
        }));

        return NextResponse.json({ plans: plansWithTests });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const adminSupabase = getAdminClient();

        if (!adminSupabase) throw new Error("Could not initialize admin client");

        const { data: plan, error } = await adminSupabase
            .from('plans')
            .insert({
                name: body.name,
                description: body.description,
                price_cents: body.price_cents,
                duration_days: body.duration_days,
                currency: body.currency || 'CAD',
                features: body.features || [],
                is_popular: body.is_popular || false,
                active: body.active !== undefined ? body.active : true,
                published: body.published || false,
                attempts_allowed: body.attempts_allowed || 3,
                allowed_tests_tags: body.allowed_tests_tags || [],
            } as any)
            .select()
            .single();

        if (error) throw error;

        // Optionally link tests
        if (body.test_ids && Array.isArray(body.test_ids) && body.test_ids.length > 0) {
            const testLinks = body.test_ids.map((testId: string) => ({
                plan_id: (plan as any).id,
                test_id: testId,
                max_attempts: 5
            }));
            const { error: linkError } = await adminSupabase
                .from('plan_tests')
                .insert(testLinks);

            if (linkError) {
                console.error("Failed to link tests to new plan", linkError);
            }
        }

        return NextResponse.json({ plan });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
