import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";

const KIWIFY_CHECKOUT = "https://pay.kiwify.com.br/UqeERMG";

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function RelatorioPage() {
  const qs = useQuery();
  const id = qs.get("id") || "";
  const token = qs.get("t") || qs.get("token") || "";

  const canLoad = Boolean(id && token);

  // "processing" | "done" | "error"
  const [status, setStatus] = useState("processing");
  const [errorMsg, setErrorMsg] = useState("");

  const [reportHtml, setReportHtml] = useState("");
  const [displayHtml, setDisplayHtml] = useState("");

  const [isPaid, setIsPaid] = useState(false);

  const [slowWarn, setSlowWarn] = useState(false);
  const [longWarn, setLongWarn] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const startedAtRef = useRef(Date.now());
  const intervalRef = useRef(null);

  // controla polling pós-done
  const doneAtRef = useRef(null);

  const STOP_AFTER_MS = 300000; // 5min (para processamento)
  const STOP_AFTER_DONE_MS = 300000; // 5min (para aguardar pagamento após done)
  const SLOW_WARN_MS = 90000; // 90s
  const LONG_WARN_MS = 180000; // 3min

  // polling
  const POLL_EVERY_MS = 2500;

  const WhatsAppLink =
    "https://wa.me/5511932087649?text=" +
    encodeURIComponent(`Oi! Preciso de suporte no relatório. Meu ID é: ${id}`);

  const checkoutUrl = useMemo(() => {
    const base = `${KIWIFY_CHECKOUT}?utm_source=relatorio`;
    if (!id || !token) return base;
    return `${base}&s1=${encodeURIComponent(id)}&s2=${encodeURIComponent(token)}`;
  }, [id, token]);

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function fetchRowOnce() {
    const { data, error } = await supabase
      .from("preview_gratuito")
      .select("id,status,report_html,error_message,access_token,paid_at")
      .eq("id", id)
      .single();

    if (error || !data) throw new Error(error?.message || "Registro não encontrado.");

    // valida token do relatório
    if (data.access_token && token && data.access_token !== token) {
      throw new Error("Token inválido ou expirado.");
    }

    const stRaw = String(data.status || "").toLowerCase().trim();
    const st = stRaw === "erro" ? "error" : stRaw;

    return {
      status: st || "processing",
      report_html: data.report_html || "",
      error_message: data.error_message || "",
      paid_at: data.paid_at || null,
    };
  }

  async function tick() {
    if (!canLoad) return;

    const now = Date.now();
    const elapsed = now - startedAtRef.current;

    // avisos de demora (somente enquanto processa)
    if (status !== "done") {
      if (elapsed >= SLOW_WARN_MS) setSlowWarn(true);
      if (elapsed >= LONG_WARN_MS) setLongWarn(true);

      if (elapsed >= STOP_AFTER_MS) {
        setTimedOut(true);
        setStatus("error");
        setErrorMsg("A análise está demorando mais do que o esperado. Tente novamente.");
        stopPolling();
        return;
      }
    }

    try {
      const row = await fetchRowOnce();

      const paidNow = Boolean(row.paid_at);

      // Se já estava done e ainda não pagou, continuamos polling até liberar ou estourar timeout pós-done
      if (status === "done" && !isPaid && !paidNow) {
        if (!doneAtRef.current) doneAtRef.current = now;

        const doneElapsed = now - doneAtRef.current;
        if (doneElapsed >= STOP_AFTER_DONE_MS) {
          // não é erro: só para de “esperar pagamento”
          stopPolling();
        }
        // mantém paywall
        return;
      }

      // Se pagou em qualquer momento, libera completo
      if (paidNow) {
        setIsPaid(true);
        if (reportHtml) setDisplayHtml(reportHtml);
        // se ainda não tinha carregado html por algum motivo, tenta carregar:
        if (!reportHtml && row.report_html) {
          setReportHtml(row.report_html);
          setDisplayHtml(row.report_html);
        }
        stopPolling();
        return;
      }

      // status pronto do relatório
      if (row.status === "done" || row.status === "done_fallback") {
        setStatus("done");
        setErrorMsg("");

        if (!doneAtRef.current) doneAtRef.current = now;

        const html = row.report_html || "";
        setReportHtml(html);

        // ainda não pagou -> mostra paywall, MAS NÃO para polling (aguarda paid_at)
        setIsPaid(false);
        setDisplayHtml(applyPaywall(html));
        return;
      }

      // erro
      if (row.status === "error") {
        setStatus("error");
        setErrorMsg(row.error_message || "Não foi possível concluir a análise. Tente novamente.");
        stopPolling();
        return;
      }

      // ainda processando
      setStatus("processing");
    } catch (e) {
      setStatus("error");
      setErrorMsg(String(e?.message || e || "Erro ao carregar relatório."));
      stopPolling();
    }
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    doneAtRef.current = null;

    if (!canLoad) {
      setStatus("error");
      setErrorMsg("Link inválido. Verifique se o link contém ?id= e &t=.");
      return;
    }

    tick();
    stopPolling();
    intervalRef.current = window.setInterval(tick, POLL_EVERY_MS);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  return (
    <Layout>
      <div style={{ minHeight: "70vh", display: "flex", justifyContent: "center", padding: "48px 16px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            background: "#111",
            border: "1px solid #222",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: 999,
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              color: "#d4af37",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
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
                        doneAtRef.current = null;
                        tick();
                        stopPolling();
                        intervalRef.current = window.setInterval(tick, POLL_EVERY_MS);
                      }}
                      style={{
                        background: "#d4af37",
                        color: "#111",
                        border: 0,
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Tentar novamente
                    </button>

                    <a
                      href={WhatsAppLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#d4af37",
                        fontWeight: 900,
                        textDecoration: "none",
                      }}
                    >
                      Falar no WhatsApp
                    </a>
                  </div>

                  {timedOut && (
                    <div style={{ marginTop: 10, color: "#aaa" }}>
                      Dica: PDFs muito pesados ou com imagem podem demorar mais.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {status === "done" && (
            <div style={{ marginTop: 14 }}>
              <div style={{ border: "1px solid #222", borderRadius: 14, overflow: "hidden", background: "#0f0f0f" }}>
                <iframe
                  title="Relatório"
                  srcDoc={displayHtml || "<div style='padding:16px;color:#aaa'>Relatório vazio.</div>"}
                  style={{ width: "100%", height: "70vh", border: 0 }}
                />
              </div>

              {!isPaid && (
                <div style={{ marginTop: 14, color: "#aaa" }}>
                  🔒 Para ver <b>riscos jurídicos detalhados</b>, <b>dívidas e responsabilidades</b> e o <b>parecer final</b>:
                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        background: "#d4af37",
                        color: "#111",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontWeight: 900,
                        textDecoration: "none",
                      }}
                    >
                      🔒 Desbloquear por R$19,90
                    </a>

                    <button
                      onClick={() => tick()}
                      style={{
                        background: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#d4af37",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Já paguei — verificar agora
                    </button>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
                    Após pagar, volte para este relatório — o desbloqueio é automático (a página fica checando o pagamento).
                  </div>
                </div>
              )}

              {isPaid && <div style={{ marginTop: 14, color: "#aaa" }}>✅ Conteúdo desbloqueado.</div>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function applyPaywall(html) {
  if (!html) return html;

  const patterns = [
    /riscos\s+jur[ií]dicos\s+detalhados/i,
    /riscos\s+principais/i,
    /d[ií]vidas?\s+e\s+responsabilidades/i,
    /d[eé]bitos?\s+e\s+responsabilidades/i,
    /vale\s+a\s+pena/i,
    /parecer\s+final/i,
    /conclus[aã]o/i,
  ];

  let cutIndex = -1;

  for (const p of patterns) {
    const m = html.match(p);
    if (m && typeof m.index === "number") {
      if (cutIndex === -1 || m.index < cutIndex) cutIndex = m.index;
    }
  }

  if (cutIndex === -1) return html;

  const visible = html.slice(0, cutIndex);

  const paywall = `
  <div style="
    margin-top:16px;
    border:1px solid #2a2a2a;
    border-radius:14px;
    padding:16px;
    background:#0f0f0f;
    color:#fff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  ">
    <div style="font-weight:900; font-size:16px; margin-bottom:8px;">🔒 Conteúdo bloqueado</div>
    <div style="color:#aaa; line-height:1.5;">
      Desbloqueie por <b style="color:#d4af37;">R$19,90</b> para ver:
      <ul style="margin:10px 0 0 18px; line-height:1.8; color:#ddd;">
        <li><b>Riscos jurídicos detalhados</b></li>
        <li><b>Dívidas e responsabilidades</b></li>
        <li><b>Parecer final</b> (vale a pena ou não)</li>
      </ul>
    </div>
  </div>
  `;

  return visible + paywall;
}
