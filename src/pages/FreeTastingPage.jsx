// src/pages/FreeTastingPage.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Link as LinkIcon,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Send,
} from "lucide-react";

import Layout from "@/components/Layout";
import FormField from "@/components/ui/FormField";
import PdfUploadField from "@/components/PdfUploadField";
import { useToast } from "@/components/ui/use-toast";
import { submitFreePreview, uploadPdfToStorage } from "@/lib/supabase";

const FreeTastingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    link: "",
    file: null,
  });

  const [errors, setErrors] = useState({});

  // Validation logs on component mount
  useEffect(() => {
    console.group("=== VALIDAÇÃO DE ENV VARS ===");
    console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log(
      "VITE_SUPABASE_ANON_KEY:",
      import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Definida" : "❌ Undefined"
    );
    const baseUrl = import.meta.env.VITE_SUPABASE_URL
      ? import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, "")
      : "";
    console.log("VITE_SUPABASE_FUNCTIONS_URL (Calculated):", `${baseUrl}/functions/v1`);
    console.groupEnd();
    console.log("================================");
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp é obrigatório";
    } else if (formData.whatsapp.replace(/\D/g, "").length < 10) {
      newErrors.whatsapp = "Número inválido (mínimo 10 dígitos)";
    }

    if (!formData.link.trim() && !formData.file) {
      newErrors.link = "Forneça o link ou faça upload do edital";
      newErrors.file = "Forneça o link ou faça upload do edital";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmissionError(null); // Reset previous errors

    if (!validateForm()) {
      toast({
        title: "Erro no formulário",
        description: "Verifique os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Starting form submission...");

    try {
      let pdfUrl = null;

      // Upload PDF (if provided)
      if (formData.file) {
        toast({
          title: "Enviando arquivo...",
          description: "Aguarde enquanto fazemos o upload do seu PDF.",
        });

        // ✅ Mantém seu padrão de chamada com string:
        const uploaded = await uploadPdfToStorage(formData.file, "free_preview_files");

        // ✅ Garante string URL
        pdfUrl = uploaded?.publicUrl || null;

        if (!pdfUrl) {
          throw new Error("Upload concluído, mas não foi possível obter a URL pública do PDF.");
        }
      }

      const editalInfo = formData.link;

      toast({
        title: "Processando...",
        description: "Iniciando análise do seu edital.",
      });

      console.log("📤 Calling submitFreePreview...");

      const response = await submitFreePreview({
        nome: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        edital_link: editalInfo,

        // ✅ CORREÇÃO: sua tabela chama url_pdf (não pdf_url)
        url_pdf: pdfUrl,
      });

      console.log("📥 Response received:", response);

      // Extract fields from response
      const id = response?.id;
      const accessToken = response?.access_token || response?.token;
      const reportUrl = response?.report_url;

      // Validate critical fields
      console.log("🔍 Validating response fields...");
      if (!id || !accessToken) {
        console.error("❌ Validation Failed. Missing ID or Access Token. Response:", response);
        throw new Error("Resposta inválida do servidor: campos obrigatórios ausentes (id, access_token)");
      }

      console.log("✅ Validation successful!");
      toast({
        title: "Solicitação enviada!",
        description: "Redirecionando para o seu relatório...",
      });

      // Determine redirect URL
      let targetUrl;
      if (reportUrl) {
        targetUrl = reportUrl.startsWith("http")
          ? new URL(reportUrl).pathname + new URL(reportUrl).search
          : reportUrl;
      } else {
        targetUrl = `/relatorio?id=${id}&t=${accessToken}`;
      }

      console.log(`🔀 Redirecting to: ${targetUrl}`);
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
  };

  return (
    <Layout>
      <Helmet>
        <title>Degustação Gratuita - Arrematando Certo</title>
        <meta
          name="description"
          content="Solicite um preview gratuito da análise do seu edital de leilão."
        />
      </Helmet>

      <div className="relative min-h-screen">
        <div className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1700225195207-14b1f002036b"
              alt="Análise de documentos"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Degustação <span className="text-[#d4af37]">Gratuita</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Conheça a qualidade da nossa análise sem custo. Envie seu edital e receba um preview
                técnico com pontos essenciais.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-black/90 backdrop-blur-md p-6 rounded-xl border border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <h3 className="text-xl font-bold mb-4 text-[#d4af37] border-b border-[#d4af37]/30 pb-2">
                  O que você vai receber:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Identificação do leilão",
                    "Datas principais",
                    "Forma de pagamento",
                    "Comissão do leiloeiro",
                    "Um exemplo de risco identificado",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black p-6 rounded-xl border border-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-[#d4af37] flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-[#d4af37] mb-2 uppercase text-sm">Atenção</h4>
                    <p className="text-sm text-gray-300">
                      Este preview é apenas uma leitura inicial. A análise completa de riscos, ônus e
                      checklist detalhado está disponível apenas nos planos pagos.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-black/95 backdrop-blur-sm p-8 rounded-2xl border border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white border-b border-[#d4af37]/30 pb-4">
                  <Send className="w-6 h-6 text-[#d4af37]" />
                  Solicitar Preview
                </h2>

                {submissionError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-bold text-red-800 text-sm mb-1">
                          ❌ Erro ao processar solicitação
                        </h4>
                        <p className="text-sm text-red-700 font-medium">{submissionError}</p>
                        <p className="text-xs text-red-500 mt-2 border-t border-red-200 pt-2">
                          Se o problema persistir, verifique o console (F12) para mais detalhes
                          técnicos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <FormField
                    label="Nome completo"
                    placeholder="Seu nome"
                    icon={User}
                    required
                    value={formData.name}
                    onChange={(v) => {
                      setFormData((prev) => ({ ...prev, name: v }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    error={errors.name}
                  />

                  <FormField
                    label="WhatsApp"
                    placeholder="(00) 00000-0000"
                    icon={Phone}
                    required
                    value={formData.whatsapp}
                    onChange={(v) => {
                      setFormData((prev) => ({ ...prev, whatsapp: v }));
                      if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: "" }));
                    }}
                    error={errors.whatsapp}
                  />
                </div>

                <div className="mb-6">
                  <FormField
                    label="E-mail"
                    placeholder="seu@email.com"
                    icon={Mail}
                    type="email"
                    required
                    value={formData.email}
                    onChange={(v) => {
                      setFormData((prev) => ({ ...prev, email: v }));
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    error={errors.email}
                  />
                </div>

                <div className="mb-8 p-6 bg-black border border-[#d4af37]/30 rounded-xl">
                  <h3 className="text-sm font-bold text-[#d4af37] mb-4 uppercase tracking-wider">
                    Documentação (Escolha uma opção)
                  </h3>

                  <div className="space-y-6">
                    <FormField
                      label="Link do Leilão"
                      placeholder="https://..."
                      icon={LinkIcon}
                      value={formData.link}
                      onChange={(v) => {
                        setFormData((prev) => ({ ...prev, link: v }));
                        if (errors.link) setErrors((prev) => ({ ...prev, link: "", file: "" }));
                      }}
                      error={errors.link}
                    />

                    <div className="flex items-center gap-4">
                      <div className="h-px bg-[#d4af37]/20 flex-1" />
                      <span className="text-[#d4af37] text-sm font-medium">OU</span>
                      <div className="h-px bg-[#d4af37]/20 flex-1" />
                    </div>

                    <PdfUploadField
                      label="Upload do Edital (PDF)"
                      onFileSelect={(file) => {
                        setFormData((prev) => ({ ...prev, file }));
                        if (file) setErrors((prev) => ({ ...prev, file: "", link: "" }));
                      }}
                      error={errors.file}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#d4af37] hover:bg-[#b8941f] text-black font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </span>
                  ) : (
                    <>
                      Receber preview gratuito
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FreeTastingPage;
