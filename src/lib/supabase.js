// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

// ⚠️ USAMOS APENAS AS VARS DO FRONT (VITE_*), COMO ERA ANTES
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("❌ VITE_SUPABASE_URL não definida");
}

if (!supabaseAnonKey) {
  console.error("❌ VITE_SUPABASE_ANON_KEY não definida");
}

// Client simples, browser, igual ao fluxo que funcionava
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
