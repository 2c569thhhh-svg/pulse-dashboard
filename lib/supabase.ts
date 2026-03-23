import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: ReturnType<typeof createClient<any>> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): ReturnType<typeof createClient<any>> {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _supabase = createClient<any>(url, key)
  }
  return _supabase
}

export const supabase = new Proxy({} as ReturnType<typeof createClient<any>>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabase() as any)[prop]
  },
})

export default supabase
