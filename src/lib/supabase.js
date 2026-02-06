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
 * Normaliza opts:
 * - Se vier string => interpreta como { bucket: string }
 * - Se vier objeto => usa normalmente
 */
function normalizeUploadOpts(opts) {
  if (!opts) return {};
  if (typeof opts === "string") return { bucket: opts };
  if (typeof opts === "object") return opts;
  return {};
}

/**
 * Upload de PDF pro Storage.
 * Aceita:
 *  - uploadPdfToStorage(file, "nome_do_bucket")
 *  - uploadPdfToStorage(file, { bucket: "nome", prefix: "pdf" })
 *
 * Retorna: { path, publicUrl }
 */
export async function uploadPdfToStorage(file, opts = {}) {
  assertSupabase();

  const o = normalizeUploadOpts(opts);

  const bucket = o.bucket || "uploads";
  const prefix = o.prefix || "pdf";

  const fileName = (file?.name || "arquivo.pdf").replace(/\s+/g, "_");
  const safeName = `${Date.now()}-${fileName}`;
  const path = `${prefix}/${safeName}`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file?.type || "application/pdf",
  });

  if (upErr) {
    // Mantém o erro “cru” do Supabase (é ele que traz "Bucket not found")
    throw upErr;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data?.publicUrl || null;

  return { path, publicUrl };
}

/**
 * Gera um token simples para acesso (client-side), mantendo seu padrão
 * de retorno (id, access_token, report_url).
 */
function generateAccessToken() {
  try {
    // Browsers modernos
    return crypto.randomUUID();
  } catch {
    // fallback
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

/**
 * Salva degustação gratuita (free_previews)
 * Retorna no padrão esperado pelo seu frontend:
 * { id, access_token, report_url }
 */
export async function submitFreePreview(payload = {}) {
  assertSupabase();

  const access_token = payload.access_token || generateAccessToken();

  // garantimos que o token vá pro banco também (pra bater com /relatorio?id=...&t=...)
  const rowToInsert = { ...payload, access_token };

  // IMPORTANT: para receber id de volta, precisa select()
  const { data, error } = await supabase
    .from("free_previews")
    .insert([rowToInsert])
    .select("id, access_token, report_url")
    .single();

  if (error) throw error;

  return {
    id: data?.id,
    access_token: data?.access_token,
    report_url: data?.report_url || null,
  };
}

export async function submitPaidSubmission(payload = {}) {
  assertSupabase();

  const { data, error } = await supabase
    .from("paid_submissions")
    .insert([payload])
    .select("id")
    .single();

  if (error) throw error;
  return { ok: true, id: data?.id };
}

export async function submitConsultationRequest(payload = {}) {
  assertSupabase();

  const { data, error } = await supabase
    .from("consultation_requests")
    .insert([payload])
    .select("id")
    .single();

  if (error) throw error;
  return { ok: true, id: data?.id };
}
