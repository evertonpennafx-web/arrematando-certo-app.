import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// mantém padrão simples
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }
  return supabase;
}

/**
 * ✅ COMPAT: apenas para NÃO quebrar build.
 * Se existir tabela, salva. Se não existir, retorna ok=false sem derrubar o site.
 */
export async function submitConsultationRequest(payload = {}) {
  try {
    const sb = assertSupabase();
    const row = {
      nome: payload.nome ?? payload.name ?? null,
      email: payload.email ?? null,
      whatsapp: payload.whatsapp ?? payload.phone ?? null,
      mensagem: payload.mensagem ?? payload.message ?? null,
      created_at: new Date().toISOString(),
    };

    // Se a tabela existir, salva. Se não existir, não derruba.
    const { error } = await sb.from("consultation_requests").insert(row);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export default supabase;
