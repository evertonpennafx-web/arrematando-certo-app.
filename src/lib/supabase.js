import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cliente principal (só no browser)
let supabase = null;

if (
  typeof window !== "undefined" &&
  supabaseUrl &&
  supabaseAnonKey
) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Upload de PDF para o Storage
 */
async function uploadPdfToStorage(file, path) {
  if (!supabase) throw new Error("Supabase not initialized");

  const { error } = await supabase.storage
    .from("pdfs")
    .upload(path, file, {
      upsert: true,
      contentType: "application/pdf",
    });

  if (error) throw error;

  const { data } = supabase.storage.from("pdfs").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Submissão paga (mantido para não quebrar build)
 */
async function submitPaidSubmission(payload) {
  if (!supabase) throw new Error("Supabase not initialized");

  const { data, error } = await supabase
    .from("paid_submissions")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export {
  supabase,
  uploadPdfToStorage,
  submitPaidSubmission,
};
