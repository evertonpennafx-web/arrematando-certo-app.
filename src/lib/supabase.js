import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('supabaseUrl is required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload genérico de PDF para o Storage
 */
export async function uploadPdfToStorage(file, pathPrefix = 'uploads') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pathPrefix}/${Date.now()}.${fileExt}`;

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
 * Preview gratuito
 */
export async function submitFreePreview(payload) {
  const { error } = await supabase
    .from('preview_gratuito')
    .insert(payload);

  if (error) throw error;
}

/**
 * Envio pago
 */
export async function submitPaidSubmission(payload) {
  const { error } = await supabase
    .from('submissions')
    .insert(payload);

  if (error) throw error;
}

/**
 * Solicitação de consultoria
 */
export async function submitConsultationRequest(payload) {
  const { error } = await supabase
    .from('consultation_requests')
    .insert(payload);

  if (error) throw error;
}
