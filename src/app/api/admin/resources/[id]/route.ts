import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createServerClient();

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete file from storage if applicable
        const { data: resource } = await supabase
            .from('resources')
            .select('url, resource_type')
            .eq('id', id)
            .single();

        if (resource?.url && ['audio', 'video', 'document'].includes(resource.resource_type || '')) {
            try {
                const url = new URL(resource.url);
                const parts = url.pathname.split('/public/test-resources/');
                if (parts.length > 1) {
                    await supabase.storage.from('test-resources').remove([parts[1]]);
                }
            } catch { /* ignore storage errors */ }
        }

        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
