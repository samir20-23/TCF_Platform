import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const supabase = createServerClient();

        // 1. Get the original test
        const { data: test, error: testError } = await supabase
            .from('tests')
            .select('*')
            .eq('id', id)
            .single();

        if (testError || !test) {
            return NextResponse.json({ error: 'Test introuvable' }, { status: 404 });
        }

        // 2. Clone the test
        const { data: newTest, error: cloneError } = await supabase
            .from('tests')
            .insert({
                name: `${test.name} (Copie)`,
                test_type: test.test_type,
                duration_minutes: test.duration_minutes,
                description: test.description,
                published: false, // Default to unpublished
            })
            .select()
            .single();

        if (cloneError || !newTest) {
            console.error('Error cloning test:', cloneError);
            return NextResponse.json({ error: 'Échec de la duplication du test' }, { status: 500 });
        }

        // 3. Clone resources
        const { data: resources } = await supabase
            .from('resources')
            .select('*')
            .eq('test_id', id);

        if (resources && resources.length > 0) {
            const resourceInserts = resources.map(r => ({
                test_id: newTest.id,
                title: r.title,
                resource_type: r.resource_type,
                url: r.url,
                description: r.description,
                published: r.published
            }));
            await supabase.from('resources').insert(resourceInserts);
        }

        // 4. Clone questions and options
        const { data: questions } = await supabase
            .from('questions')
            .select('*, question_options(*)')
            .eq('test_id', id);

        if (questions && questions.length > 0) {
            for (const q of questions) {
                const { data: newQ, error: qError } = await supabase
                    .from('questions')
                    .insert({
                        test_id: newTest.id,
                        section: q.section,
                        question_text: q.question_text,
                        question_type: q.question_type,
                        points: q.points,
                        order_index: q.order_index,
                        explanation: q.explanation,
                        audio_url: q.audio_url,
                        image_url: q.image_url
                    })
                    .select()
                    .single();

                if (!qError && newQ && q.question_options) {
                    const optionInserts = q.question_options.map((opt: any) => ({
                        question_id: newQ.id,
                        option_text: opt.option_text,
                        is_correct: opt.is_correct,
                        order_index: opt.order_index
                    }));
                    await supabase.from('question_options').insert(optionInserts);
                }
            }
        }

        return NextResponse.json({ success: true, testId: newTest.id });
    } catch (error: any) {
        console.error('Duplicate Test error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
