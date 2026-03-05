import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

// POST: create a new resource linked to a test (admin only)
export async function POST(request: Request) {
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
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    let {
      testId,
      title,
      resourceType,
      url,
      description,
      published,
      transcript,
      replayLimit,
      questionId,
      visibility,
      isRequired,
    } = body;

    if (!testId || !resourceType) {
      return NextResponse.json({ error: 'testId and resourceType are required' }, { status: 400 });
    }

    // Canonicalize resource type: 'doc' -> 'document'
    if (resourceType === 'doc') {
      resourceType = 'document';
    }

    const now = new Date().toISOString();

    // Get next order_index
    const { count } = await supabase
      .from('resources')
      .select('id', { count: 'exact', head: true })
      .eq('test_id', testId);

    const resourceData: any = {
      test_id: testId,
      title: title ?? null,
      resource_type: resourceType,
      url: url ?? null,
      description: description ?? null,
      published: published ?? true,
      is_required: isRequired ?? false,
      updated_at: now,
    };

    // Try inserting with new columns
    const { data: inserted, error: insertError } = await supabase
      .from('resources')
      .insert({
        ...resourceData,
        transcript: transcript ?? null,
        replay_limit: replayLimit ?? 3,
        question_id: questionId ?? null,
        visibility: visibility ?? 'public',
        order_index: count ?? 0,
        created_at: now,
      })
      .select()
      .single();

    if (insertError) {
      console.warn('First insert failed, trying fallback:', insertError.message);

      // Fallback 1: Maybe 'document' isn't in ENUM yet?
      if (resourceType === 'document') {
        resourceData.resource_type = 'doc';
      }

      // Fallback 2: Try without new columns
      const { data: fallbackInserted, error: fallbackError } = await supabase
        .from('resources')
        .insert(resourceData)
        .select()
        .single();

      if (fallbackError) {
        console.error('Resource creation failed completely:', fallbackError);
        return NextResponse.json({
          error: 'Failed to create resource',
          details: fallbackError.message,
          hint: 'Ensure database migrations are applied (run supabase db push or check migrations directory).'
        }, { status: 500 });
      }

      return NextResponse.json({ resource: fallbackInserted, warning: 'Inserted using fallback (check migrations)' }, { status: 201 });
    }

    return NextResponse.json({ resource: inserted }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in admin/resources POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
