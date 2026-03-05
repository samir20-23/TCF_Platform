import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

// GET: List users with filters, using only migration-defined columns
export async function GET(request: Request) {
  try {
    // Use regular client for auth check
    const authClient = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client to bypass RLS for admin operations
    const supabase = createServerClient();

    // Check if user is admin (based on migrations: users.role enum)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error loading admin profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify admin permissions' },
        { status: 500 },
      );
    }

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Build query using only columns/tables from migrations
    let query = supabase
      .from('users')
      .select(
        `
        id,
        email,
        name,
        name,
        role,
        status,
        created_at,
        updated_at,
        subscriptions:subscriptions (
          id,
          status,
          start_at,
          end_at,
          plan:plans (
            id,
            name
          )
        ),
        attempts (
            id,
            score_total,
            status,
            created_at
        )
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,name.ilike.%${search}%`,
      );
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 },
      );
    }

    const enrichedUsers = (users || []).map((u: any) => {
      const activeSub = u.subscriptions?.find((s: any) => s.status === 'active');
      const latestAttempt = u.attempts?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      const maxScore = u.attempts?.reduce((max: number, a: any) => Math.max(max, a.score_total || 0), 0) || 0;

      return {
        ...u,
        plan_name: activeSub?.plan?.name || 'Gratuit',
        expiry: activeSub?.end_at || null,
        last_score: latestAttempt ? latestAttempt.score_total : null,
        max_score: maxScore,
        attempts_count: u.attempts?.length || 0,
        attempts: undefined // Remove to save payload size
      };
    });

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PATCH: Update user role or status, using only columns from migrations
export async function PATCH(request: Request) {
  try {
    // Use regular client for auth check
    const authClient = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client for admin operations
    const supabase = createServerClient();

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error loading admin profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify admin permissions' },
        { status: 500 },
      );
    }

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      userId,
      role,
      status: newStatus,
      name,
      plan_ids,
    } = body as {
      userId?: string;
      role?: string;
      status?: string;
      name?: string;
      plan_ids?: string[];
    };

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    // Build updates object restricted to users table columns
    const updates: Record<string, any> = {};
    if (role) updates.role = role;
    if (newStatus) updates.status = newStatus;
    if (name) updates.name = name;
    updates.updated_at = new Date().toISOString();

    // Manage subscription using SubscriptionManager
    // Manage subscriptions using SubscriptionManager with new plan_ids array logic
    if (typeof plan_ids !== 'undefined') {
      if (!plan_ids || plan_ids.length === 0) {
        // Deactivate all existing subscriptions
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('status', 'active');
      } else {
        const { activateSubscription } = await import('@/lib/subscription-manager');
        try {
          // Deactivate any currently active subscriptions that were UNCHECKED
          const { data: activeSubs } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', userId)
            .eq('status', 'active');

          const activePlanIds = activeSubs?.map(sub => sub.plan_id) || [];
          const plansToRemove = activePlanIds.filter(pid => !plan_ids.includes(pid));

          if (plansToRemove.length > 0) {
            await supabase
              .from('subscriptions')
              .update({ status: 'canceled', updated_at: new Date().toISOString() })
              .eq('user_id', userId)
              .eq('status', 'active')
              .in('plan_id', plansToRemove);
          }

          // Activate new subscriptions that weren't already active
          const plansToAdd = plan_ids.filter(pid => !activePlanIds.includes(pid));

          if (plansToAdd.length > 0) {
            // Fetch plans to get amount and currency
            const { data: plans } = await supabase
              .from('plans')
              .select('id, price_cents, currency')
              .in('id', plansToAdd);

            if (plans) {
              for (const plan of plans) {
                await activateSubscription({
                  userId,
                  planId: plan.id,
                  provider: 'manual',
                  providerPaymentId: `admin-${user.id}-${plan.id}-${Date.now()}`,
                  amountCents: plan.price_cents,
                  currency: plan.currency || 'MAD',
                  metadata: { activatedBy: user.id }
                });
              }
            }
          }
        } catch (err: any) {
          console.error('Error managing subscriptions via admin:', err);
          return NextResponse.json({ error: 'Failed to update subscriptions', details: err.message }, { status: 500 });
        }
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error(
        'Error updating user profile:',
        updateError.message,
        'Data:',
        updates,
      );

      // Fallback: If updated_at is the problem, try without it
      if (updateError.message.includes('updated_at')) {
        delete updates.updated_at;
        const { data: updatedRetry, error: retryError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (retryError) {
          return NextResponse.json(
            {
              error: 'Failed to update user profile (retry)',
              details: retryError.message,
            },
            { status: 500 },
          );
        }
        return NextResponse.json({
          user: updatedRetry,
          message: 'User updated successfully',
        });
      }

      return NextResponse.json(
        { error: 'Failed to update user profile', details: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      user: updated,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
