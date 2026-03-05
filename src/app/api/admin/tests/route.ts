import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

// GET: list tests with attached resources (admin only)
export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Check admin role from users table (migrations)
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

    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, name, test_type, duration_minutes, level, description, published, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tests:', error);
      return NextResponse.json({ error: 'Failed to fetch tests', details: error.message }, { status: 500 });
    }

    // Since we can't do complex joins/counts easily without schema certainty, fetch counts separately if needed
    // but for now, let's just return the tests to unblock the UI
    const enrichedTests = await Promise.all((tests || []).map(async (t: any) => {
      const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('test_id', t.id);
      const { data: resData } = await supabase.from('resources').select('id, title, resource_type, url, description, published, created_at').eq('test_id', t.id);

      return {
        ...t,
        question_count: qCount || 0,
        resources: resData || []
      };
    }));

    return NextResponse.json({ tests: enrichedTests });
  } catch (error) {
    console.error('Unexpected error in admin/tests GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST: create a new test (admin only)
export async function POST(request: Request) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

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
      name,
      test_type,
      duration_minutes,
      level,
      description,
      published,
    } = body as {
      name?: string;
      test_type?: string;
      duration_minutes?: number | null;
      level?: string | null;
      description?: string | null;
      published?: boolean;
    };

    if (!name || !test_type) {
      return NextResponse.json(
        { error: 'name and test_type are required' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const insertData: any = {
      name,
      test_type,
      duration_minutes: duration_minutes ?? null,
      level: body.level || level || 'B2',
      description: description ?? null,
      published: published ?? false,
      created_at: now,
      updated_at: now,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('tests')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating test:', insertError);
      return NextResponse.json(
        { error: 'Failed to create test', details: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ test: inserted }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in admin/tests POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

