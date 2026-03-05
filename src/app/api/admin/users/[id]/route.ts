import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authClient = await createClient();
        const { data: { user }, error: authError } = await authClient.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Fetch user, their active subscriptions, and sub_test_access
        const { data: userData, error } = await supabase
            .from('users')
            .select(`
                id, email, name, status, role,
                subscriptions (
                    id, plan_id, status, start_at, end_at,
                    plan:plans (id, name, duration_days),
                    sub_test_access (
                        id, remaining_attempts,
                        plan_test:plan_tests(
                            test:tests(id, name, test_type)
                        )
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching user details:', error);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: userData });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authClient = await createClient();
        const { data: { user }, error: authError } = await authClient.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createServerClient();
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { subscriptionId, status } = body;

        if (!subscriptionId || !status) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { data: updatedSub, error } = await supabase
            .from('subscriptions')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', subscriptionId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ subscription: updatedSub });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
