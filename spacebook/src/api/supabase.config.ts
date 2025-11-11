import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaskey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient( supabaseUrl, supabaskey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
})
