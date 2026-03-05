import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/serverClient';

const ALLOWED_MIME_TYPES = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/webm',
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif'
];

const MAX_SIZE_MAP: Record<string, number> = {
    'video': 500 * 1024 * 1024, // 500 MB
    'audio': 50 * 1024 * 1024,  // 50 MB
    'application': 20 * 1024 * 1024, // 20 MB
    'image': 10 * 1024 * 1024,   // 10 MB
};

export async function POST(request: Request) {
    try {
        const supabase = createServerClient();
        const body = await request.json();
        const { fileName, contentType, fileSize, bucket = 'tcf_storage', context = 'uploads', entityId } = body;

        if (!fileName || !contentType) {
            return NextResponse.json({ error: 'fileName and contentType are required' }, { status: 400 });
        }

        // 1. Validate MIME Type
        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            return NextResponse.json({ error: `Invalid file type: ${contentType}` }, { status: 400 });
        }

        // 2. Validate File Size
        const typePrefix = contentType.split('/')[0];
        const maxSize = MAX_SIZE_MAP[typePrefix] || MAX_SIZE_MAP['application'];
        if (fileSize && fileSize > maxSize) {
            return NextResponse.json({ error: `File size exceeds limit (${maxSize / (1024 * 1024)}MB)` }, { status: 400 });
        }

        // F2: Smart file renaming - short, unique names organized by context
        const fileExt = fileName.split('.').pop();
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        // Organized paths: courses/thumb_xxx.ext or lessons/{id}/video_xxx.ext
        const path = entityId
            ? `${context}/${entityId}/${uniqueName}`
            : `${context}/${uniqueName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUploadUrl(path);

        if (error) throw error;

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

        return NextResponse.json({
            uploadUrl: data.signedUrl,
            publicUrl,
            path: path,
            bucket: bucket,
            token: data.token
        });
    } catch (error: any) {
        console.error('Storage upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

