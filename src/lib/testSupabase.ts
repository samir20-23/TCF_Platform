// C:\C-MAIN\TCF-Platform\tcf_canada_prep\src\lib\testSupabase.ts
import { supabaseServer } from './supabase/serverClient'

export async function getAllData() {
  const { data: users, error: userError } = await supabaseServer
    .from('user_profiles')
    .select('*')

  const { data: plans, error: planError } = await supabaseServer
    .from('plans')
    .select('*')

  const { data: attempts, error: attemptError } = await supabaseServer
    .from('test_attempts')
    .select('*')

  return {
    users: users || [],
    plans: plans || [],
    attempts: attempts || [],
    errors: {
      users: userError || null,
      plans: planError || null,
      attempts: attemptError || null
    }
  }
}
