import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ❗ NUNCA quebre o front
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Variáveis de ambiente ausentes');
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Upload genérico de PDF
 */
export async function uploadPdfToStorage(file, pathPrefix = 'uploads') {
  if (!supabase) throw new Error('Supabase não inicializado');

  const ext = file.name.split('.').pop();
  const fileName = `${pathPrefix}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file);

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
  if (!supabase) throw new Error('Supabase não inicializado');

  const { error } = await supabase
    .from('preview_gratuito')
    .insert(payload);

  if (error) throw error;
}

/**
 * Envio pago
 */
export async function submitPaidSubmission(payload) {
  if (!supabase) throw new Error('Supabase não inicializado');

  const { error } = await supabase
    .from('submissions')
    .insert(payload);

  if (error) throw error;
}

/**
 * Consultoria
 */
export async function submitConsultationRequest(payload) {
  if (!supabase) throw new Error('Supabase não inicializado');

  const { error } = await supabase
    .from('consultation_requests')
    .insert(payload);

  if (error) throw error;
}
