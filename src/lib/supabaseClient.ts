// Supabase client setup for database access
import { createClient } from '@supabase/supabase-js';

// Get Supabase project URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export a configured Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
