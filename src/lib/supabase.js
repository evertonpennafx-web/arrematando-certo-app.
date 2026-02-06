import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// ✅ Como antes: se faltar env, não quebra build
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }
  return supabase;
}

/**
 * ✅ Volta o export que sua ConsultationPage espera.
 * Se sua tabela tiver outro nome, troque aqui.
 */
export async function submitConsultationRequest(payload = {}) {
  const sb = assertSupabase();

  const row = {
    nome: payload.nome ?? payload.name ?? null,
    email: payload.email ?? null,
    whatsapp: payload.whatsapp ?? payload.phone ?? null,
    mensagem: payload.mensagem ?? payload.message ?? null,
    created_at: new Date().toISOString(),
  };

  // Tabela típica de leads/consultoria:
  const { error } = await sb.from("consultation_requests").insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export default supabase;
