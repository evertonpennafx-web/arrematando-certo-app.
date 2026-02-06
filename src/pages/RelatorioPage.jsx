import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function RelatorioPage() {
  const qs = useQuery();
  const id = qs.get("id") || "";
  const token = qs.get("t") || qs.get("token") || "";

  const [status, setStatus] = useState("processing"); // processing | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [reportHtml, setReportHtml] = useState("");

  const [slowWarn, setSlowWarn] = useState(false);
  const [longWarn, setLongWarn] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const startedAtRef = useRef(Date.now());
  const intervalRef = useRef(null);

  const STOP_AFTER_MS = 300000; // 5min
  const SLOW_WARN_MS = 90000;   // 90s
  const LONG_WARN_MS = 180000;  // 3min
  const POLL_EVERY_MS = 2500;   // 2.5s

  const canLoad = Boolean(id && token);

  const WhatsAppLink =
    "https://wa.me/5511999999999?text=" + // <-- TROQUE AQUI
    encodeURIComponent(`Oi! Meu relatório demorou/travou. Meu ID é: ${id}`);

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function fetchRowOnce() {
    const { data, error } = await supabase
      .from("preview_gratuito")
      .select("id,status,report_html,error_message,access_token")
      .eq("id", id)
      .single();

    if (error || !data) throw new Error(error?.message || "Registro não encontrado.");

    if (data.access_token && token && data.access_token !== token) {
      throw new Error("Token inválido ou expirado.");
    }

    const stRaw = (data.status || "").toLowerCase().trim();
    const st = stRaw === "erro" ? "error" : stRaw; // compat

    return {
      status: st || "processing",
      report_html: data.report_html || "",
      error_message: data.error_message || "",
    };
  }

  async function tick() {
    if (!canLoad) return;

    const elapsed = Date.now() - startedAtRef.current;

    if (elapsed >= SLOW_WARN_MS) setSlowWarn(true);
    if (elapsed >= LONG_WARN_MS) setLongWarn(true);

    if (elapsed >= STOP_AFTER_MS) {
      setTimedOut(true);
      setStatus("error");
      setErrorMsg("A análise está demorando mais do que o esperado. Tente novamente.");
      stopPolling();
      return;
    }

    try {
      const row = await fetchRowOnce();

      if (row.status === "done") {
        setStatus("done");
        setReportHtml(row.report_html);
        setErrorMsg("");
        stopPolling();
        return;
      }

      if (row.status === "error") {
        setStatus("error");
        setErrorMsg(row.error_message || "Não foi possível concluir a análise. Tente novamente.");
        stopPolling();
        return;
      }

      setStatus("processing");
    } catch (e) {
      setStatus("error");
      setErrorMsg(String(e?.message || e || "Erro ao carregar relatório."));
      stopPolling();
    }
  }

  useEffect(() => {
    startedAtRef.current = Date.now();

    if (!canLoad) {
      setStatus("error");
      setErrorMsg("Link inválido. Verifique se o link contém ?id= e &t=.");
      return;
    }

    tick();
    stopPolling();
    intervalRef.current = setInterval(tick, POLL_EVERY_MS);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  return (
    <Layout>
      <div style={{ minHeight: "70vh", display: "flex", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ width: "100%", maxWidth: 980, background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#d4af37", fontWeight: 800, fontSize: 12 }}>
            PRÉVIA AUTOMÁTICA
          </div>

          <h1 style={{ margin: "10px 0 6px", fontSize: 22, color: "#fff" }}>Relatório</h1>
          <p style={{ marginTop: 0, color: "#aaa" }}>
            Importante: esta é uma <b>prévia automática</b> e não substitui análise jurídica.
          </p>

          {status !== "done" && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, border: "1px solid #222", background: "#0f0f0f" }}>
              {status === "processing" && (
                <>
                  <b style={{ color: "#fff" }}>⏳ Analisando seu edital…</b>
                  <div style={{ marginTop: 8, color: "#aaa" }}>
                    Isso pode levar de alguns segundos a alguns minutos dependendo do PDF.
                  </div>

                  {slowWarn && (
                    <div style={{ marginTop: 12, color: "#d4af37" }}>
                      ⚠️ Tá demorando um pouco… mas ainda está processando.
                    </div>
                  )}

                  {longWarn && (
                    <div style={{ marginTop: 12, color: "#aaa" }}>
                      Se preferir, me chame no WhatsApp:
                      <div style={{ marginTop: 8 }}>
                        <a href={WhatsAppLink} target="_blank" rel="noreferrer" style={{ color: "#d4af37", fontWeight: 800 }}>
                          Falar no WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {status === "error" && (
                <>
                  <b style={{ color: "#fff" }}>❌ Não consegui concluir a análise.</b>
                  <div style={{ marginTop: 8, color: "#aaa" }}>
                    {errorMsg || "Tente novamente em alguns instantes."}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setTimedOut(false);
                        setSlowWarn(false);
                        setLongWarn(false);
                        setErrorMsg("");
                        setStatus("processing");
                        startedAtRef.current = Date.now();
                        tick();
                        stopPolling();
                        intervalRef.current = setInterval(tick, POLL_EVERY_MS);
                      }}
                      style={{ background: "#d4af37", color: "#111", border: 0, borderRadius: 10, padding: "10px 14px", fontWeight: 900, cursor: "pointer" }}
                    >
                      Tentar novamente
                    </button>

                    <a
                      href={WhatsAppLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 14px", color: "#d4af37", fontWeight: 900, textDecoration: "none" }}
                    >
                      Falar no WhatsApp
                    </a>
                  </div>

                  {timedOut && <div style={{ marginTop: 10, color: "#aaa" }}>Dica: PDFs muito pesados ou com imagem podem demorar mais.</div>}
                </>
              )}
            </div>
          )}

          {status === "done" && (
            <div style={{ marginTop: 14 }}>
              <div style={{ border: "1px solid #222", borderRadius: 14, overflow: "hidden", background: "#0f0f0f" }}>
                <iframe
                  title="Relatório"
                  srcDoc={reportHtml || "<div style='padding:16px;color:#aaa'>Relatório vazio.</div>"}
                  style={{ width: "100%", height: "70vh", border: 0 }}
                />
              </div>

              <div style={{ marginTop: 14, color: "#aaa" }}>
                Quer uma análise completa (humana) antes de dar o lance?
                <div style={{ marginTop: 8 }}>
                  <a href={WhatsAppLink} target="_blank" rel="noreferrer" style={{ color: "#d4af37", fontWeight: 900 }}>
                    Falar no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
