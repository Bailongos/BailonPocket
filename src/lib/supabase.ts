import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a dummy client if credentials are not provided (this allows the app to compile and run normally without Supabase)
export const supabase = 
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'AQUI_TU_SUPABASE_PROJECT_URL'
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null; // Check for null before using!
