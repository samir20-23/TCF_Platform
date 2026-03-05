import { createServerClient } from '@/lib/supabase/serverClient';

export async function testQuestionCreation(testId: string) {
    const supabase = createServerClient();

    const payload = {
        type: 'singleChoice',
        title: 'Debug Test Question',
        prompt: 'This is a test question for debugging.',
        points: 1,
        is_required: true,
        time_limit_seconds: null,
        order_index: 0,
        metadata: {},
        question_options: [
            { option_text: 'Option 1', is_correct: true, order_index: 0 },
            { option_text: 'Option 2', is_correct: false, order_index: 1 }
        ]
    };

    console.log('Sending payload to /api/admin/tests/' + testId + '/questions');

    try {
        const { data: question, error } = await supabase
            .from('questions')
            .insert({
                test_id: testId,
                type: payload.type,
                title: payload.title,
                prompt: payload.prompt,
                points: payload.points,
                is_required: payload.is_required,
                time_limit_seconds: payload.time_limit_seconds,
                order_index: payload.order_index,
                metadata: payload.metadata
            })
            .select()
            .single();

        if (error) {
            console.error('DATABASE ERROR (questions):', error);
            return;
        }

        console.log('Question created successfully:', question.id);

        const optionsWithId = payload.question_options.map((opt) => ({
            ...opt,
            question_id: question.id,
        }));

        const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsWithId);

        if (optionsError) {
            console.error('DATABASE ERROR (question_options):', optionsError);
            return;
        }

        console.log('Options created successfully.');
    } catch (e) {
        console.error('RUNTIME ERROR:', e);
    }
}
