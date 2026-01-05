
import { createClient } from '@supabase/supabase-js';

// These are injected at BUILD TIME by esbuild via process.env expansion
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance: any = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  // Check if variables were properly injected during build
  if (!SUPABASE_URL || SUPABASE_URL === '$SUPABASE_URL' || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '$SUPABASE_ANON_KEY') {
    console.warn("Supabase credentials missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in Render Environment variables.");
    return null;
  }
  
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseInstance;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
};

export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  status: (!SUPABASE_URL || SUPABASE_URL.includes('$')) ? 'Disconnected' : 'Configured'
});

export const saveSupabaseConfig = () => {
  console.info("Automatic linking is active. Configuration is managed via Environment Variables.");
};
