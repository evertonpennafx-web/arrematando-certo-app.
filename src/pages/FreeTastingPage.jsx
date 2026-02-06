// dentro do handleSubmit, substitua SOMENTE o trecho do try { ... } por este:

try {
  let pdfUrl = null;

  if (formData.file) {
    toast({
      title: "Enviando arquivo...",
      description: "Aguarde enquanto fazemos o upload do seu PDF.",
    });

    // ✅ agora funciona com string OU objeto por causa da lib refeita
    const uploaded = await uploadPdfToStorage(formData.file, "free_preview_files");

    // ✅ pega a URL correta
    pdfUrl = uploaded?.publicUrl;

    if (!pdfUrl) {
      throw new Error("Upload concluído, mas não foi possível obter a URL pública do PDF.");
    }
  }

  let editalInfo = formData.link;

  toast({
    title: "Processando...",
    description: "Iniciando análise do seu edital.",
  });

  // ✅ agora submitFreePreview devolve { id, access_token, report_url }
  const response = await submitFreePreview({
    nome: formData.name,
    email: formData.email,
    whatsapp: formData.whatsapp,
    edital_link: editalInfo,
    pdf_url: pdfUrl,
  });

  const id = response?.id;
  const accessToken = response?.access_token || response?.token;
  const reportUrl = response?.report_url;

  if (!id || !accessToken) {
    console.error("❌ Missing fields. Response:", response);
    throw new Error("Resposta inválida do servidor: campos obrigatórios ausentes (id, access_token)");
  }

  toast({
    title: "Solicitação enviada!",
    description: "Redirecionando para o seu relatório...",
  });

  let targetUrl;
  if (reportUrl) {
    targetUrl = reportUrl.startsWith("http")
      ? new URL(reportUrl).pathname + new URL(reportUrl).search
      : reportUrl;
  } else {
    targetUrl = `/relatorio?id=${id}&t=${accessToken}`;
  }

  setTimeout(() => navigate(targetUrl), 1500);

} catch (error) {
  console.error("❌ Submission cycle error:", error);
  setSubmissionError(error?.message || "Ocorreu um erro inesperado.");

  toast({
    title: "Erro ao enviar solicitação",
    description: error?.message || "Ocorreu um erro desconhecido. Tente novamente.",
    variant: "destructive",
  });
} finally {
  setIsSubmitting(false);
}
