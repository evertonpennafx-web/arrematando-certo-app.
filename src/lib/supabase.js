import { supabase } from '@/lib/customSupabaseClient';

/**
 * Uploads a PDF file to Supabase Storage
 * @param {File} file
 * @param {string} folder
 * @returns {Promise<string|null>} Public URL of the uploaded file
 */
export const uploadPdfToStorage = async (file, folder = 'uploads') => {
  if (!file) return null;

  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const filePath = `${folder}/${timestamp}_${cleanFileName}`;

  try {
    const { error } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

/**
 * Helper to retrieve PDF URL (if needed for later fetching)
 */
export const getPdfUrl = async (tableName, recordId) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('pdf_url')
      .eq('id', recordId)
      .single();

    if (error) throw error;
    return data?.pdf_url;
  } catch (error) {
    console.error('Error fetching PDF URL:', error);
    return null;
  }
};

/**
 * Submits a free preview request by calling the 'rapid-worker' Edge Function.
 *
 * @param {Object} data - { nome, email, whatsapp, edital_link, pdf_url }
 * @returns {Promise<{id: string, access_token: string, report_url?: string}>}
 */
export const submitFreePreview = async (data) => {
  console.group("=== SUBMIT FREE PREVIEW START ===");
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Environment Variables in submitFreePreview");
      throw new Error("Configuração Supabase incompleta. Verifique as variáveis de ambiente no Vercel.");
    }

    console.log("✅ Env vars checked. Invoking 'rapid-worker'...");

    const { data: responseData, error } = await supabase.functions.invoke('rapid-worker', {
      body: {
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp,
        edital_link: data.edital_link,
        pdf_url: data.pdf_url
      }
    });

    if (error) {
      console.error('❌ Edge Function invocation error:', error);
      throw error;
    }

    console.log("✅ Edge Function response received:", responseData);
    return responseData;
  } catch (error) {
    console.error('❌ Error inside submitFreePreview:', error);
    throw error;
  } finally {
    console.groupEnd();
  }
};

/**
 * Submits a consultation request to Supabase
 */
export const submitConsultationRequest = async (data) => {
  try {
    const { error } = await supabase
      .from('consultation_requests')
      .insert([
        {
          nome: data.nome,
          email: data.email,
          whatsapp: data.whatsapp,
          caso_link_descricao: data.caso_link_descricao,
          pdf_url: data.pdf_url,
          status: 'pendente'
        }
      ]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error submitting consultation request:', error);
    throw error;
  }
};

/**
 * Submits a paid analysis request to Supabase
 */
export const submitPaidSubmission = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('paid_submissions')
      .insert([
        {
          nome: data.nome,
          email: data.email,
          whatsapp: data.whatsapp,
          plano: data.plano,
          plan_type: data.plan_type,
          documentos: data.documentos,
          descricao: data.descricao,
          pdf_url: data.pdf_url,
          status: 'pendente'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error submitting paid request:', error);
    throw error;
  }
};

/**
 * Updates a paid submission with Stripe session ID
 */
export const updateSubmissionStripeSession = async (submissionId, sessionId) => {
  try {
    const { error } = await supabase
      .from('paid_submissions')
      .update({
        stripe_session_id: sessionId,
        status: 'processando'
      })
      .eq('id', submissionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating stripe session:', error);
    throw error;
  }
};

export default supabase;

