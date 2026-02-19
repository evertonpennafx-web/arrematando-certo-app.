// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) console.error("❌ VITE_SUPABASE_URL não está definida");
if (!supabaseAnonKey) console.error("❌ VITE_SUPABASE_ANON_KEY não está definida");

// ✅ Só cria o client se tiver as envs (evita app “funcionar” mas não salvar nada)
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * ✅ Salvar lead (tabela: public.leads)
 * Colunas esperadas (ajuste se sua tabela for diferente):
 * source, plan, nome, whatsapp, email, link_leilao
 */
export async function saveLead(payload) {
  // backup local sempre
  try {
    localStorage.setItem("ac_lead", JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));
  } catch (_) {}

  if (!supabase) {
    // sem supabase configurado — não quebra UI
    return { ok: false, error: "Supabase não configurado (env vars ausentes)" };
  }

  try {
    const { error } = await supabase.from("leads").insert([
      {
        source: payload?.source ?? "submission",
        plan: payload?.plan ?? null,
        nome: payload?.nome ?? null,
        whatsapp: payload?.whatsapp ?? null,
        email: payload?.email ?? null,
        link_leilao: payload?.link_leilao ?? null,
      },
    ]);

    if (error) return { ok: false, error: error.message, details: error };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Erro desconhecido", details: err };
  }
}

/**
 * ✅ Mantém compatibilidade com o projeto
 * (usado em src/pages/ConsultationPage.jsx)
 */
export async function submitConsultationRequest(payload) {
  const table = payload?.table || "consultation_requests";

  if (!supabase) return { ok: false, error: "Supabase não configurado (env vars ausentes)" };

  const { data, error } = await supabase.from(table).insert([
    {
      nome: payload?.nome ?? null,
      whatsapp: payload?.whatsapp ?? null,
      email: payload?.email ?? null,
      mensagem: payload?.mensagem ?? payload?.message ?? null,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) return { ok: false, error: error.message, details: error };
  return { ok: true, data };
}

/**
 * 🔧 Opcional: Edge Function
 */
export async function invokeCreatePreview(payload) {
  if (!supabase) return { ok: false, error: "Supabase não configurado (env vars ausentes)" };

  const { data, error } = await supabase.functions.invoke("create_preview", { body: payload });

  if (error) return { ok: false, error: error.message, details: error };
  return data ?? { ok: true };
}
