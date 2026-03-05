import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

/**
 * Browser-safe Supabase client for client-side operations.
 * Uses public anonymous key.
 */
export const supabase = createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey
);

/**
 * Admin Supabase client for server-side ONLY operations.
 * Uses service role key - NEVER EXPOSE TO CLIENT.
 */
export const supabaseAdmin = createSupabaseClient(
    config.supabase.url_private,
    config.supabase.serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
