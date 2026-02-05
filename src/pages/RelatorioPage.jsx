import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RelatorioPage() {
  const [state, setState] = useState({
    status: "loading", // loading | processing | error | done
    title: "",
    message: "",
    html: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const token = params.get("t");

    if (!id || !token) {
      setState({
        status: "error",
        title: "Link inválido",
        message: "Parâmetros ausentes no link.",
      });
      return;
    }

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("preview_gratuito")
        .select(
          "id,status,access_token,token_expires_at,error_message,report_html"
        )
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setState({
          status: "error",
          title: "Acesso negado",
          message: error.message,
        });
        return;
      }

      if (!data) {
        setState({
          status: "error",
          title: "Relatório não encontrado",
          message: "Esse link não existe ou expirou.",
        });
        return;
      }

      if (data.access_token !== token) {
        setState({
          status: "error",
          title: "Acesso negado",
          message: "Token inválido.",
        });
        return;
      }

      if (
        data.token_expires_at &&
        new Date(data.token_expires_at).getTime() < Date.now()
      ) {
        setState({
          status: "error",
          title: "Link expirado",
          message: "Esse relatório expirou.",
        });
        return;
      }

      if (data.status === "erro") {
        setState({
          status: "error",
          title: "Erro ao gerar relatório",
          message: data.error_message || "Erro desconhecido.",
        });
        return;
      }

      // ✅ STATUS FINAL CORRETO
      if (data.status === "done" && data.report_html) {
        setState({
          status: "done",
          html: data.report_html,
        });
        return;
      }

      // ainda processando → tenta novamente
      setState({ status: "processing" });
      setTimeout(load, 5000);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // UI
  if (state.status === "loading" || state.status === "processing") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Relatório de Análise</h1>
        <p>Estamos analisando seu documento…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>{state.title}</h2>
        <p>{state.message}</p>
        <a href="/">Voltar ao início</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 24 }}>
      <div dangerouslySetInnerHTML={{ __html: state.html }} />
    </div>
  );
}
