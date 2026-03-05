import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

// GET: Fetch test + questions + resources for admin editor
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const supabase = createServerClient();

        const { data: test, error: testErr } = await supabase
            .from('tests')
            .select('*')
            .eq('id', id)
            .single();

        if (testErr || !test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        const { data: questions } = await supabase
            .from('questions')
            .select('*, question_options(*)')
            .eq('test_id', id)
            .order('order_index', { ascending: true });

        const { data: resources } = await supabase
            .from('resources')
            .select('*')
            .eq('test_id', id)
            .order('order_index', { ascending: true });

        return NextResponse.json({ test, questions: questions || [], resources: resources || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update a specific test
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const supabase = createServerClient();
        const body = await request.json();

        const { data: updated, error } = await supabase
            .from('tests')
            .update({
                name: body.name,
                test_type: body.test_type,
                duration_minutes: body.duration_minutes,
                level: body.level,
                description: body.description,
                published: body.published,
                practice_mode: body.practice_mode ?? false,
                total_points: body.total_points,
                max_attempts: body.max_attempts,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating test:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ test: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a test
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const supabase = createServerClient();

        const { data: resources } = await supabase
            .from('resources')
            .select('url')
            .eq('test_id', id);

        if (resources && resources.length > 0) {
            const filePaths = resources
                .map(r => {
                    try {
                        const url = new URL(r.url);
                        const parts = url.pathname.split('/public/test-resources/');
                        return parts.length > 1 ? parts[1] : null;
                    } catch { return null; }
                })
                .filter(Boolean) as string[];

            if (filePaths.length > 0) {
                await supabase.storage.from('test-resources').remove(filePaths);
            }
        }

        const { error: deleteError } = await supabase
            .from('tests')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
