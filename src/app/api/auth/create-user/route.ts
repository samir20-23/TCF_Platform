import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/auth/create-user
 * Creates a row in public.users for a newly registered auth user.
 * Uses service-role client to bypass RLS.
 *
 * Body: { id: string, email: string, name?: string }
 * Returns: 201 created | 409 already exists | 500 error
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, email, name } = body;

        if (!id || !email) {
            return NextResponse.json(
                { error: 'id and email are required' },
                { status: 400 }
            );
        }

        const supabase = getAdminClient();

        const { data, error } = await supabase
            .from('users')
            .insert([{
                id,
                email,
                name: name || '',
                role: 'student',
                status: 'active',
            }])
            .select()
            .single();

        if (error) {
            // Unique violation = user already exists
            if (error.code === '23505') {
                return NextResponse.json(
                    { message: 'User already exists' },
                    { status: 409 }
                );
            }
            console.error('Error creating user:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (err: any) {
        console.error('Unexpected error in create-user:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
