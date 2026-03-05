import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-only Supabase client using the SERVICE_ROLE_KEY.
 * Use this ONLY in API routes or Server Actions.
 * This client bypasses RLS policies.
 */
export const createServerClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('createServerClient must only be used on the server');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const supabaseServer = typeof window === 'undefined' ? createServerClient() : null as any;
