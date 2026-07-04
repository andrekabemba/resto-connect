const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("L'URL Supabase ou la clé Anon est manquante.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
