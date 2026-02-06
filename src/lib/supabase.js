import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Mantém compat com seu projeto: se faltar env, não quebra build
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }
  return supabase;
}

/**
 * Captura de lead (consultoria) — SOMENTE INSERT.
 * Ajuste o nome da tabela aqui (deixe 1 só).
 */
const CONSULT_TABLE = "consultation_requests"; // <-- se sua tabela tiver outro nome, troque aqui

export async function submitConsultationRequest(payload = {}) {
  const sb = assertSupabase();

  const row = {
    nome: payload.nome ?? payload.name ?? null,
    email: payload.email ?? null,
    whatsapp: payload.whatsapp ?? payload.phone ?? null,
    mensagem: payload.mensagem ?? payload.message ?? null,
    origem: payload.origem ?? payload.source ?? "consultoria",
    created_at: new Date().toISOString(),
  };

  const { error } = await sb.from(CONSULT_TABLE).insert(row);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export default supabase;
