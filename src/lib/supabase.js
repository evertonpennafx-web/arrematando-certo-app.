// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("❌ VITE_SUPABASE_URL não está definida");
}
if (!supabaseAnonKey) {
  console.error("❌ VITE_SUPABASE_ANON_KEY não está definida");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ✅ Mantém compatibilidade com o projeto
 * Essa função existia e está sendo importada em src/pages/ConsultationPage.jsx
 * Ajuste o nome da tabela/colunas se necessário (mas isso já compila e evita quebrar o build).
 */
export async function submitConsultationRequest(payload) {
  // Tenta salvar em uma tabela padrão. Se a sua tabela tiver outro nome,
  // você pode trocar aqui depois — mas o build volta agora.
  const table =
    payload?.table ||
    "consultation_requests"; // <- se sua tabela tiver outro nome, troque aqui

  const { data, error } = await supabase.from(table).insert([
    {
      nome: payload?.nome ?? null,
      whatsapp: payload?.whatsapp ?? null,
      email: payload?.email ?? null,
      mensagem: payload?.mensagem ?? payload?.message ?? null,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    // não quebra UI: devolve ok:false
    return { ok: false, error: error.message, details: error };
  }

  return { ok: true, data };
}

/**
 * 🔧 Função utilitária opcional: chamada direta da edge function
 * (Se você quiser usar em páginas sem repetir código)
 */
export async function invokeCreatePreview(payload) {
  const { data, error } = await supabase.functions.invoke("create_preview", { body: payload });

  if (error) {
    return { ok: false, error: error.message, details: error };
  }
  return data ?? { ok: true };
}
