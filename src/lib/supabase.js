import { createClient } from '@supabase/supabase-js';

// Default mock values if env vars are missing so the app doesn't crash during setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
