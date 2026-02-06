import { createClient } from "@supabase/supabase-js";

// ENV do Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * IMPORTANTE:
 * - Mantém o padrão antigo do projeto: se faltar env, supabase vira null (não quebra build).
 * - E mantém exports que outras páginas podem estar importando (compat).
 */
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
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

/**
 * ✅ COMPAT: páginas antigas importam isso:
 * import { submitConsultationRequest } from "@/lib/supabase";
 *
 * Implementação segura:
 * - tenta inserir em uma tabela comum
 * - se não existir, retorna erro (runtime), mas NÃO quebra build
 */
export async function submitConsultationRequest(payload = {}) {
  const sb = assertSupabase();

  // Campos comuns (não obriga nada)
  const row = {
    name: payload.name ?? payload.nome ?? null,
    email: payload.email ?? null,
    whatsapp: payload.whatsapp ?? payload.phone ?? null,
    message: payload.message ?? payload.mensagem ?? null,
    created_at: new Date().toISOString(),
    source: payload.source ?? "consultation_page",
  };

  // Tenta algumas tabelas prováveis (pra ser resiliente sem saber seu schema exato)
  const tableCandidates = ["consultation_requests", "consultoria_leads", "leads_consultoria", "leads"];

  let lastErr = null;

  for (const table of tableCandidates) {
    const { error } = await sb.from(table).insert(row);
    if (!error) return { ok: true, table };
    lastErr = error;
  }

  return {
    ok: false,
    error: lastErr?.message || "Falha ao enviar solicitação de consultoria.",
  };
}

/**
 * ✅ COMPAT extra:
 * alguns arquivos podem usar default import do client
 */
export default supabase;
