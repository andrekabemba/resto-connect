import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("L'URL Supabase ou la clé Anon est manquante dans les variables d'environnement.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
