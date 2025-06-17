import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : ({
        from() {
          return {
            upsert: async () => {},
            select: async () => ({ data: null }),
          }
        },
        auth: {
          getSession: async () => ({ data: { session: null } }),
          signInWithPassword: async () => ({ data: { session: null }, error: null }),
          signOut: async () => {},
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
      } as unknown as SupabaseClient)
