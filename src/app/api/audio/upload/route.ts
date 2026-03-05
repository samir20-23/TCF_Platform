import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Get a signed URL for uploading audio
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { fileName, mimeType, purpose, lessonId } = body;

        // Validate input
        if (!fileName || !mimeType) {
            return NextResponse.json(
                { error: 'fileName and mimeType are required' },
                { status: 400 }
            );
        }

        // Validate mime type
        const allowedMimes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav'];
        if (!allowedMimes.includes(mimeType)) {
            return NextResponse.json(
                { error: 'Invalid audio format. Allowed: webm, mp3, ogg, wav' },
                { status: 400 }
            );
        }

        // Generate unique file path
        const timestamp = Date.now();
        const ext = fileName.split('.').pop() || 'webm';
        const storagePath = `${user.id}/${purpose || 'speaking'}/${timestamp}.${ext}`;

        // Create signed upload URL
        const { data: signedUrl, error: signError } = await supabase.storage
            .from('student-submissions')
            .createSignedUploadUrl(storagePath);

        if (signError) {
            console.error('Error creating signed URL:', signError);
            return NextResponse.json(
                { error: 'Failed to create upload URL' },
                { status: 500 }
            );
        }

        // Create audio file record (with placeholder URL until upload completes)
        const publicUrl = supabase.storage
            .from('student-submissions')
            .getPublicUrl(storagePath).data.publicUrl;

        const { data: audioFile, error: insertError } = await supabase
            .from('audio_files')
            .insert({
                owner_id: user.id,
                url: publicUrl,
                purpose: purpose || 'speaking_submission',
                file_name: fileName,
                mime_type: mimeType,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating audio record:', insertError);
            // Continue anyway - the file can still be uploaded
        }

        return NextResponse.json({
            uploadUrl: signedUrl.signedUrl,
            token: signedUrl.token,
            path: storagePath,
            publicUrl,
            audioFileId: audioFile?.id,
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH: Update audio file record after upload (duration, size)
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { audioFileId, durationSeconds, sizeBytes, transcription } = body;

        if (!audioFileId) {
            return NextResponse.json(
                { error: 'audioFileId is required' },
                { status: 400 }
            );
        }

        const { data: updated, error: updateError } = await supabase
            .from('audio_files')
            .update({
                duration_seconds: durationSeconds,
                size_bytes: sizeBytes,
                transcription,
            })
            .eq('id', audioFileId)
            .eq('owner_id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating audio file:', updateError);
            return NextResponse.json(
                { error: 'Failed to update audio file' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            audioFile: updated,
            message: 'Audio file updated',
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
