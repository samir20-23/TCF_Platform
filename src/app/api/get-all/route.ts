// src/app/api/get-all/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/serverClient'

export async function GET() {
  try {
    const tableNames = [
      'admin_activity_log',
      'audio_files',
      'contact_submissions',
      'courses',
      'lessons',
      'payment_history',
      'plans',
      'practice_tests',
      'questions',
      'submissions',
      'subscriptions',
      'test_attempts',
      'user_achievements',
      'user_course_enrollments',
      'user_lesson_progress',
      'user_profiles',
      'user_statistics'
    ]

    const result: Record<string, any[]> = {}
    const errors: Record<string, string | null> = {}

    for (const name of tableNames) {
      try {
        const { data, error } = await supabaseServer
          .from(name)
          .select('*')
          .limit(1000)

        if (error) {
          console.error(`Supabase select error for ${name}:`, error)
          // Provide more detailed error information
          errors[name] = error.message || error.code || 'Unknown error'
          result[name] = []
          continue
        }

        result[name] = data ?? []
        errors[name] = null
      } catch (e: any) {
        console.error(`Unexpected error for ${name}:`, e)
        errors[name] = e?.message ?? 'unknown error'
        result[name] = []
      }
    }

    return NextResponse.json({ tables: result, errors }, { status: 200 })
  } catch (err: any) {
    console.error('GET /api/get-all fatal error:', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
