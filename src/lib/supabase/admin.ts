import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

/**
 * Admin Supabase client using service role key
 * ONLY use this in server-side code (API routes, server actions)
 * This client bypasses RLS - use with caution
 */
export function createAdminClient() {
    if (!supabaseConfig.serviceRoleKey) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY is not set. Admin client requires service role key.'
        );
    }

    return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Get admin client singleton for reuse
 * Useful for webhook handlers and background jobs
 */
let adminClientInstance: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
    if (!adminClientInstance) {
        adminClientInstance = createAdminClient();
    }
    return adminClientInstance;
}
