// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

function assertSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente (Vercel)."
    );
  }
}

/**
 * Upload de PDF pro Storage (bucket padrão: 'uploads').
 * Retorna: { path, publicUrl }
 */
export async function uploadPdfToStorage(file, opts = {}) {
  assertSupabase();

  const bucket = opts.bucket || "uploads";
  const prefix = opts.prefix || "pdf";
  const safeName = `${Date.now()}-${(file?.name || "arquivo.pdf").replace(/\s+/g, "_")}`;
  const path = `${prefix}/${safeName}`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file?.type || "application/pdf",
  });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data?.publicUrl };
}

/**
 * Mantive essas funções “genéricas” pra não quebrar o build.
 * Você pode ajustar o nome das tabelas depois.
 */
export async function submitFreePreview(payload = {}) {
  assertSupabase();
  // tenta salvar numa tabela padrão; se não existir, pelo menos a UI não “morre” silenciosamente
  const { error } = await supabase.from("free_previews").insert([payload]);
  if (error) throw error;
  return { ok: true };
}

export async function submitPaidSubmission(payload = {}) {
  assertSupabase();
  const { error } = await supabase.from("paid_submissions").insert([payload]);
  if (error) throw error;
  return { ok: true };
}

export async function submitConsultationRequest(payload = {}) {
  assertSupabase();
  const { error } = await supabase.from("consultation_requests").insert([payload]);
  if (error) throw error;
  return { ok: true };
}
