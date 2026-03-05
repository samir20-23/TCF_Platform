import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');
        const bucket = searchParams.get('bucket') || 'tcf_storage';

        if (!path) {
            return NextResponse.json({ error: 'path is required' }, { status: 400 });
        }

        const supabase = createServerClient();
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 3600); // 1 hour expiry

        if (error) throw error;

        return NextResponse.json({ url: data.signedUrl });
    } catch (error: any) {
        console.error('Storage download error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
