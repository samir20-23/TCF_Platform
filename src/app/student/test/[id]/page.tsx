import { createServerClient } from '@/lib/supabase/serverClient';
import { redirect } from 'next/navigation';
import TestTakingSession from '../components/TestTakingSession';

interface PageProps {
    params: { id: string };
}

export default async function TestPage({ params }: PageProps) {
    const { id: testId } = await params;
    const supabase = createServerClient();

    // 1. Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    // 2. Fetch test metadata
    const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

    if (testError || !test) redirect('/student-dashboard');

    // 3. Start or get attempt
    const attemptRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/student/test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `sb-access-token=${session.access_token}` },
        body: JSON.stringify({ testId })
    }).then(r => r.json());

    if (!attemptRes.attempt) {
        console.error('Failed to start attempt:', attemptRes.error);
        redirect('/student-dashboard');
    }

    // 4. Fetch questions
    const { data: questions } = await supabase
        .from('questions')
        .select('*, question_options(*)')
        .eq('test_id', testId)
        .order('order_index', { ascending: true });

    return (
        <div className="min-h-screen bg-background">
            <TestTakingSession
                testId={testId}
                initialAttempt={attemptRes.attempt}
                questions={questions || []}
            />
        </div>
    );
}
