import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/serverClient';

// Allowed MIME types for upload
const ALLOWED_MIME_TYPES = [
    // Audio
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm',
    // Video
    'video/mp4', 'video/webm', 'video/quicktime',
    // Documents
    'application/pdf',
    // Images
    'image/jpeg', 'image/png', 'image/webp', 'image/gif'
];

// Max file sizes in bytes
const MAX_SIZE_MAP: Record<string, number> = {
    'video': 500 * 1024 * 1024,      // 500 MB for video
    'audio': 50 * 1024 * 1024,       // 50 MB for audio
    'application': 20 * 1024 * 1024, // 20 MB for PDFs
    'image': 10 * 1024 * 1024,       // 10 MB for images
};

export async function POST(request: Request) {
    try {
        // Authenticate user
        const authSupabase = await createClient();
        const { data: { user }, error: authError } = await authSupabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized: Please log in' },
                { status: 401 }
            );
        }

        // Check user role for admin uploads
        const { data: profile } = await authSupabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const body = await request.json();
        const { 
            fileName, 
            contentType, 
            fileSize, 
            bucket = 'tcf_storage',
            folder = 'uploads',
            requireAdmin = false 
        } = body;

        // Validate required fields
        if (!fileName || !contentType) {
            return NextResponse.json(
                { error: 'fileName and contentType are required' },
                { status: 400 }
            );
        }

        // Check admin requirement for certain uploads
        if (requireAdmin && profile?.role !== 'admin' && profile?.role !== 'instructor') {
            return NextResponse.json(
                { error: 'Forbidden: Admin or instructor access required' },
                { status: 403 }
            );
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            return NextResponse.json(
                { 
                    error: `Invalid file type: ${contentType}`,
                    allowedTypes: ALLOWED_MIME_TYPES 
                },
                { status: 400 }
            );
        }

        // Validate file size
        const typePrefix = contentType.split('/')[0];
        const maxSize = MAX_SIZE_MAP[typePrefix] || MAX_SIZE_MAP['application'];
        
        if (fileSize && fileSize > maxSize) {
            return NextResponse.json(
                { 
                    error: `File size exceeds limit`,
                    maxSizeMB: Math.round(maxSize / (1024 * 1024)),
                    providedSizeMB: Math.round(fileSize / (1024 * 1024))
                },
                { status: 400 }
            );
        }

        // Generate unique filename to prevent collisions
        const fileExt = fileName.split('.').pop() || 'bin';
        const sanitizedName = fileName
            .replace(/\.[^/.]+$/, '') // Remove extension
            .replace(/[^a-zA-Z0-9-_]/g, '_') // Sanitize
            .substring(0, 50); // Limit length
        
        const uniqueName = `${sanitizedName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const path = `${folder}/${user.id}/${uniqueName}`;

        // Use service role client for storage operations
        const serverSupabase = createServerClient();

        // Create signed upload URL
        const { data, error } = await serverSupabase.storage
            .from(bucket)
            .createSignedUploadUrl(path);

        if (error) {
            console.error('Storage error:', error);
            return NextResponse.json(
                { 
                    error: 'Failed to create upload URL',
                    details: error.message,
                    hint: 'Make sure the storage bucket exists and has proper permissions'
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            uploadUrl: data.signedUrl,
            token: data.token,
            path: path,
            bucket: bucket,
            expiresIn: 3600, // 1 hour
            message: 'Use the uploadUrl with a PUT request to upload your file'
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Signed upload error:', errorMessage);
        return NextResponse.json(
            { error: 'Internal server error', details: errorMessage },
            { status: 500 }
        );
    }
}
