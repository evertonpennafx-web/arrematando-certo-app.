import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Layout from "@/components/Layout";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function RelatorioPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const id = params.get("id");
  const token = params.get("t");

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState(null);
  const [error, setError] = useState("");

  const canQuery = useMemo(() => Boolean(id && token), [id, token]);

  async function fetchRow() {
    const { data, error: err } = await supabase
      .from("preview_gratuito")
      .select("id, status, report_html, access_token, token_expires_at, error_message")
      .eq("id", id)
      .single();

    if (err) throw err;
    return data;
  }

  async function triggerAnalyze() {
    try {
      await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      // silencioso: o polling vai capturar status/error
    }
  }

  useEffect(() => {
    if (!canQuery) {
      navigate("/");
      return;
    }

    let timer;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchRow();

        // valida token
        if (data.access_token !== token) {
          setError("Token inválido.");
          setLoading(false);
          return;
        }

        // valida expiração (opcional)
        if (data.token_expires_at) {
          const exp = new Date(data.token_expires_at).getTime();
          if (Date.now() > exp) {
            setError("Link expirado. Solicite nova degustação.");
            setLoading(false);
            return;
          }
        }

        setRow(data);

        // 🔥 Se estiver "received" ou "processing" e não tiver report, garante o disparo
        if ((data.status === "received" || data.status === "processing") && !data.report_html) {
          await triggerAnalyze();
        }

        // polling
        timer = setInterval(async () => {
          try {
            const updated = await fetchRow();
            setRow(updated);

            if (updated.status === "done" && updated.report_html) {
              clearInterval(timer);
              setLoading(false);
              return;
            }

            if (updated.status === "error") {
              clearInterval(timer);
              setError(updated.error_message || "Erro ao processar.");
              setLoading(false);
              return;
            }
          } catch (e) {
            // mantém tentando
          }
        }, 3000);

        setLoading(false);
      } catch (e) {
        setError("Erro ao buscar relatório.");
        setLoading(false);
      }
    })();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [canQuery, id, token, navigate]);

  const isProcessing =
    row && (row.status === "received" || row.status === "processing") && !row.report_html;

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl">
          {error ? (
            <div className="bg-black/50 border border-red-500/40 rounded-2xl p-8 text-center">
              <h1 className="text-3xl font-bold mb-3 text-red-400">Erro</h1>
              <p className="text-gray-300">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg"
              >
                Voltar para Home
              </button>
            </div>
          ) : isProcessing ? (
            <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-10 text-center">
              <h1 className="text-4xl font-bold mb-4">Relatório de Análise</h1>
              <p className="text-gray-300 mb-6">
                Estamos analisando seu documento...<br />
                Essa página atualiza automaticamente.
              </p>
              <div className="text-yellow-400 font-bold">Processando...</div>
            </div>
          ) : row?.status === "done" && row?.report_html ? (
            <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: row.report_html }}
              />
            </div>
          ) : loading ? (
            <div className="text-center text-gray-300">Carregando...</div>
          ) : (
            <div className="text-center text-gray-300">
              Aguardando processamento...
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
