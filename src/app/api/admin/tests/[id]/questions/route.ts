import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

// GET: Fetch all questions for a specific test
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: testId } = await params;
        const supabase = createServerClient();

        const { data: questions, error } = await supabase
            .from('questions')
            .select(`
        *,
        question_options (*)
      `)
            .eq('test_id', testId)
            .order('order_index', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ questions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new question for a test
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: testId } = await params;
        const supabase = createServerClient();
        const body = await request.json();

        const { data: question, error } = await supabase
            .from('questions')
            .insert({
                test_id: testId,
                type: body.type,
                title: body.title,
                prompt: body.prompt,
                points: body.points || 1,
                is_required: body.is_required ?? true,
                time_limit_seconds: body.time_limit_seconds || null,
                order_index: body.order_index || 0,
                metadata: body.metadata || {},
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If options are provided (MCQ, Matching), insert them
        const options = body.question_options || body.options;
        if (options && options.length > 0) {
            const optionsWithId = options.map((opt: any) => ({
                ...opt,
                question_id: question.id,
            }));
            const { error: optionsError } = await supabase
                .from('question_options')
                .insert(optionsWithId);

            if (optionsError) {
                return NextResponse.json({
                    error: 'Question created but options failed',
                    details: optionsError.message
                }, { status: 500 });
            }
        }

        return NextResponse.json({ question });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
