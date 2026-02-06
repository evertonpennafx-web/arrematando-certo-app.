// src/pages/RelatorioPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, Link } from "react-router-dom";

import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";

export default function RelatorioPage() {
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const id = params.get("id");
  const token = params.get("t");

  const [state, setState] = useState({
    status: "loading", // loading | processing | error | done
    title: "",
    message: "",
    html: "",
  });

  useEffect(() => {
    // Supabase não configurado
    if (!supabase) {
      setState({
        status: "error",
        title: "Configuração incompleta",
        message:
          "Supabase não está configurado no ambiente. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.",
        html: "",
      });
      return;
    }

    // Link inválido
    if (!id || !token) {
      setState({
        status: "error",
        title: "Link inválido",
        message: "Parâmetros ausentes no link (id e t).",
        html: "",
      });
      return;
    }

    let cancelled = false;
    let timer = null;

    async function load() {
      if (cancelled) return;

      try {
        const { data, error } = await supabase
          .from("preview_gratuito")
          .select("id,status,access_token,token_expires_at,error_message,report_html")
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setState({
            status: "error",
            title: "Erro ao buscar relatório",
            message: error.message,
            html: "",
          });
          return;
        }

        if (!data) {
          setState({
            status: "error",
            title: "Relatório não encontrado",
            message: "Esse link não existe ou expirou.",
            html: "",
          });
          return;
        }

        // valida token
        if (data.access_token !== token) {
          setState({
            status: "error",
            title: "Acesso negado",
            message: "Token inválido.",
            html: "",
          });
          return;
        }

        // valida expiração (se tiver)
        if (data.token_expires_at && new Date(data.token_expires_at).getTime() < Date.now()) {
          setState({
            status: "error",
            title: "Link expirado",
            message: "Esse relatório expirou.",
            html: "",
          });
          return;
        }

        // status erro
        if (data.status === "erro" || data.status === "error") {
          setState({
            status: "error",
            title: "Erro ao gerar relatório",
            message: data.error_message || "Erro desconhecido.",
            html: "",
          });
          return;
        }

        // status final
        if (data.status === "done" && data.report_html) {
          setState({
            status: "done",
            title: "",
            message: "",
            html: data.report_html,
          });
          return;
        }

        // ainda processando
        setState((prev) => ({
          ...prev,
          status: "processing",
          title: "",
          message: "",
        }));

        timer = setTimeout(load, 4000);
      } catch (e) {
        setState({
          status: "error",
          title: "Falha inesperada",
          message: String(e?.message || e),
          html: "",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, token]);

  // UI
  if (state.status === "loading" || state.status === "processing") {
    return (
      <Layout>
        <Helmet>
          <title>Relatório - Arrematando Certo</title>
        </Helmet>

        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-xl bg-black/80 border border-[#d4af37]/40 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(212,175,55,0.12)]">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Relatório de Análise
            </h1>
            <p className="text-gray-300 mb-6">
              Estamos analisando seu documento…
              <br />
              Essa página atualiza automaticamente.
            </p>

            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#d4af37] font-semibold">
                {state.status === "loading" ? "Carregando..." : "Processando..."}
              </span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.status === "error") {
    return (
      <Layout>
        <Helmet>
          <title>Relatório - Erro</title>
        </Helmet>

        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-xl bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">{state.title}</h2>
            <p className="text-red-700 mb-6">{state.message}</p>

            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-black text-white font-bold hover:opacity-90 transition"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // DONE
  return (
    <Layout>
      <Helmet>
        <title>Relatório - Arrematando Certo</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-black/90 border border-[#d4af37]/30 rounded-2xl p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: state.html }} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
