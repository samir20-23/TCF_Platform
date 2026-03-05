import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function POST(request: Request) {
    try {
        const supabase = createServerClient();
        const body = await request.json();

        const { lesson_id, title, description, duration_seconds, passing_score, max_attempts, shuffle_questions, show_correct_answers } = body;

        if (!lesson_id || !title) {
            return NextResponse.json(
                { error: 'Lesson ID and Title are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('practice_tests')
            .insert([{
                lesson_id,
                title,
                description,
                duration_seconds: duration_seconds || 1800,
                passing_score: passing_score || 60,
                max_attempts: max_attempts || 3,
                shuffle_questions: shuffle_questions || false,
                show_correct_answers: show_correct_answers || true
            }])
            .select('*')
            .single();

        if (error) {
            console.error('Error creating practice test:', error);
            return NextResponse.json(
                { error: 'Failed to create practice test', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
