import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId } = await request.json();
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

        const adminSupabase = getAdminClient();
        if (!adminSupabase) throw new Error("Admin client failed");

        // Get user email
        const { data: targetUser, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
        if (userError || !targetUser.user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Trigger password reset email
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const { error: resetError } = await adminSupabase.auth.admin.generateLink({
            type: 'recovery',
            email: targetUser.user.email || '',
            options: { redirectTo: `${siteUrl}/auth/update-password` }
        });

        if (resetError) throw resetError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
