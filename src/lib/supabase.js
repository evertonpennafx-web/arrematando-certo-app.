import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('supabaseUrl and supabaseAnonKey are required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload do PDF para o Storage
 */
export async function uploadPdfToStorage(file) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from('pdfs')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Envio de preview gratuito
 */
export async function submitFreePreview(payload) {
  const { data, error } = await supabase.functions.invoke(
    'submit_free_preview',
    {
      body: payload,
    }
  );

  if (error) throw error;
  return data;
}

/**
 * Envio de submissão paga
 */
export async function submitPaidSubmission(payload) {
  const { data, error } = await supabase.functions.invoke(
    'submit_paid_submission',
    {
      body: payload,
    }
  );

  if (error) throw error;
  return data;
}
