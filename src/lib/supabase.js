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

        // ✅ Edge Function exige 'url_pdf'
        url_pdf: data.pdf_url,

        // (opcional) compatibilidade: não atrapalha se a função ignorar
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
