import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

// PATCH: Update a specific question
export async function PATCH(
    request: Request,
    { params }: { params: { id: string; questionId: string } }
) {
    try {
        const { questionId } = await params;
        const supabase = createServerClient();
        const body = await request.json();

        const { data: question, error } = await supabase
            .from('questions')
            .update({
                type: body.type,
                title: body.title,
                prompt: body.prompt,
                points: body.points,
                is_required: body.is_required,
                time_limit_seconds: body.time_limit_seconds,
                order_index: body.order_index,
                metadata: body.metadata || {},
                updated_at: new Date().toISOString(),
            })
            .eq('id', questionId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Handle options update if provided
        const options = body.question_options || body.options;
        if (options) {
            // Simplest way: Delete old options and insert new ones
            await supabase.from('question_options').delete().eq('question_id', questionId);

            if (options.length > 0) {
                const optionsWithId = options.map((opt: any) => ({
                    ...opt,
                    question_id: questionId,
                }));
                await supabase.from('question_options').insert(optionsWithId);
            }
        }

        return NextResponse.json({ question });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a question
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; questionId: string } }
) {
    try {
        const { questionId } = await params;
        const supabase = createServerClient();

        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', questionId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
