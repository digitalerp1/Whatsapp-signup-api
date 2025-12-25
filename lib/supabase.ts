import { createClient } from '@supabase/supabase-js';

// TODO: REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT CREDENTIALS
// Go to https://supabase.com/dashboard/project/_/settings/api
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);