import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { supabase } from "@/lib/customSupabaseClient";
import Layout from "@/components/Layout";

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default function RelatorioPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const t = searchParams.get("t");

  const [state, setState] = useState({
    loading: true,
    status: "iniciando", // iniciando | processando | finalizado | erro | invalido
    reportHtml: "",
    errorMessage: "",
    invalid: false,
  });

  useEffect(() => {
    let timer;
    let cancelled = false;

    const MAX_WAIT_MS = 60000; // 60s
    const INTERVAL_MS = 5000;  // 5s
    const startedAt = Date.now();

    async function load() {
      try {
        // 1) Validação básica do link
        if (!id || !t || !isUuid(id)) {
          setState({
            loading: false,
            status: "invalido",
            reportHtml: "",
            errorMessage: "Link inválido ou incompleto. Verifique se o endereço está correto.",
            invalid: true,
          });
          return;
        }

        // 2) Enquanto estiver tentando, mantém como processando
        setState((prev) => ({
          ...prev,
          loading: true,
          status: "processando",
          invalid: false,
          errorMessage: "",
        }));

        // 3) Busca no Supabase (pode ainda não existir registro)
        const { data, error } = await supabase
          .from("preview_gratuito")
          .select("status, report_html, error_message")
          .eq("id", id)
          .eq("access_token", t)
          .maybeSingle();

        if (cancelled) return;

        // 4) Se deu erro (rede, RLS, etc.), tenta novamente até timeout
        if (error) {
          console.error("Fetch error:", error);

          const expired = Date.now() - startedAt >= MAX_WAIT_MS;
          if (expired) {
            setState({
              loading: false,
              status: "invalido",
              reportHtml: "",
              errorMessage: "Não foi possível carregar o relatório agora. Tente novamente em instantes.",
              invalid: true,
            });
            return;
          }

          timer = setTimeout(load, INTERVAL_MS);
          return;
        }

        // 5) Se ainda NÃO existe registro, isso é normal -> continua processando
        if (!data) {
          const expired = Date.now() - startedAt >= MAX_WAIT_MS;
          if (expired) {
            setState({
              loading: false,
              status: "invalido",
              reportHtml: "",
              errorMessage: "Relatório ainda não ficou pronto. Aguarde e tente novamente.",
              invalid: true,
            });
            return;
          }

          timer = setTimeout(load, INTERVAL_MS);
          return;
        }

        const status = (data.status || "").toLowerCase();

        // 6) Finalizado -> mostra HTML
        if (status === "finalizado") {
          setState({
            loading: false,
            status: "finalizado",
            reportHtml: data.report_html || "",
            errorMessage: "",
            invalid: false,
          });
          return;
        }

        // 7) Erro -> mostra mensagem
        if (status === "erro") {
          setState({
            loading: false,
            status: "erro",
            reportHtml: "",
            errorMessage: data.error_message || "Ocorreu um erro durante a análise do documento.",
            invalid: false,
          });
          return;
        }

        // 8) Qualquer outro status -> continua processando (com timeout)
        const expired = Date.now() - startedAt >= MAX_WAIT_MS;
        if (expired) {
          setState({
            loading: false,
            status: "invalido",
            reportHtml: "",
            errorMessage: "Relatório ainda não ficou pronto. Aguarde e tente novamente.",
            invalid: true,
          });
          return;
        }

        timer = setTimeout(load, INTERVAL_MS);
      } catch (err) {
        console.error("Unexpected error:", err);
        if (cancelled) return;

        setState({
          loading: false,
          status: "erro",
          reportHtml: "",
          errorMessage: "Falha inesperada ao carregar relatório.",
          invalid: false,
        });
      }
    }

    load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, t]);

  const StatusBadge = ({ type, text }) => {
    const styles = {
      success: "bg-green-100 text-green-800 border-green-200",
      error: "bg-red-100 text-red-800 border-red-200",
      process: "bg-blue-100 text-blue-800 border-blue-200",
      neutral: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
          styles[type] || styles.neutral
        } inline-flex items-center gap-2`}
      >
        {type === "success" && <CheckCircle2 className="w-4 h-4" />}
        {type === "process" && <Loader2 className="w-4 h-4 animate-spin" />}
        {type === "error" && <AlertCircle className="w-4 h-4" />}
        {text}
      </span>
    );
  };

  return (
    <Layout>
      <Helmet>
        <title>Relatório de Análise - Arrematando Certo</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-[#d4af37] w-8 h-8" />
                Relatório de Análise
              </h1>
              <p className="text-gray-500 mt-1">Arrematando Certo - Preview Gratuito</p>
            </div>

            <div>
              {state.status === "finalizado" && (
                <StatusBadge type="success" text="Análise Concluída" />
              )}
              {state.status === "erro" && <StatusBadge type="error" text="Erro na Análise" />}
              {state.status === "processando" && (
                <StatusBadge type="process" text="Em Análise..." />
              )}
              {state.invalid && <StatusBadge type="error" text="Acesso Negado" />}
            </div>
          </header>

          <main className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] border border-gray-100 relative">
            {/* Invalid / Error State Display */}
            {(state.invalid || state.status === "erro") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-10">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {state.invalid ? "Link Inválido ou Expirado" : "Não foi possível concluir"}
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">{state.errorMessage}</p>
                <a
                  href="/"
                  className="mt-8 px-6 py-3 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-[#b8941f] transition-colors"
                >
                  Voltar ao Início
                </a>
              </div>
            )}

            {/* Processing State Display */}
            {state.status === "processando" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-10">
                <div className="w-24 h-24 mb-8 relative">
                  <div className="absolute inset-0 border-4 border-[#d4af37]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#d4af37] rounded-full border-t-transparent animate-spin"></div>
                  <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-[#d4af37] animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
                  Analisando seu documento...
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Nossa IA está lendo o edital e identificando os principais pontos. <br />
                  Isso pode levar alguns instantes.
                </p>
              </div>
            )}

            {/* Success State - Report Content */}
            {state.status === "finalizado" && state.reportHtml && (
              <div className="p-8 md:p-12 animate-in fade-in duration-500">
                <div className="mb-8 p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Nota:</strong> Este é um relatório preliminar gerado por inteligência artificial.
                    Para uma análise jurídica completa e aprofundada, considere nossos planos profissionais.
                  </div>
                </div>

                <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-a:text-[#d4af37] prose-strong:text-gray-800">
                  <div dangerouslySetInnerHTML={{ __html: state.reportHtml }} />
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                  <h3 className="text-xl font-bold mb-4">Gostou da análise?</h3>
                  <p className="text-gray-600 mb-6">
                    Tenha acesso a uma consultoria completa com nossos especialistas.
                  </p>
                  <a
                    href="/?plan=express#pricing"
                    className="inline-block px-8 py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    Ver Planos Completos
                  </a>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
