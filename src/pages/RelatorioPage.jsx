import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";

const KIWIFY_CHECKOUT = "https://pay.kiwify.com.br/UqeERMG";

/* ===========================
   PREÇO CENTRALIZADO (NUNCA MAIS CAÇA)
=========================== */
const UNLOCK_PRICE_CENTS = 3990;

const formatBRL = (cents) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const UNLOCK_PRICE_LABEL = formatBRL(UNLOCK_PRICE_CENTS);

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function RelatorioPage() {
  const qs = useQuery();
  const id = qs.get("id") || "";
  const token = qs.get("t") || qs.get("token") || "";

  const canLoad = Boolean(id && token);

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

  const STOP_AFTER_MS = 300000;
  const SLOW_WARN_MS = 90000;
  const LONG_WARN_MS = 180000;
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
      .eq("access_token", token)
      .single();

    if (error || !data) {
      throw new Error("Registro não encontrado (id/token inválidos).");
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

      if (row.status === "done" || row.status === "done_fallback") {
        setStatus("done");
        stopPolling();

        const html = row.report_html || "";
        setReportHtml(html);

        const paidNow = Boolean(row.paid_at);
        setIsPaid(paidNow);
        setDisplayHtml(paidNow ? html : applyPaywall(html));

        return;
      }

      if (row.status === "error") {
        setStatus("error");
        setErrorMsg(row.error_message || "Não foi possível concluir a análise.");
        stopPolling();
        return;
      }

      setStatus("processing");
    } catch (e) {
      setStatus("error");
      setErrorMsg(String(e?.message || e));
      stopPolling();
    }
  }

  useEffect(() => {
    startedAtRef.current = Date.now();

    if (!canLoad) {
      setStatus("error");
      setErrorMsg("Link inválido.");
      return;
    }

    tick();
    stopPolling();
    intervalRef.current = window.setInterval(tick, POLL_EVERY_MS);

    return () => stopPolling();
  }, [id, token]);

  return (
    <Layout>
      <div style={{ minHeight: "70vh", display: "flex", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ width: "100%", maxWidth: 980, background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#d4af37", fontWeight: 800, fontSize: 12 }}>
            PRÉVIA AUTOMÁTICA
          </div>

          <h1 style={{ margin: "10px 0 6px", fontSize: 22, color: "#fff" }}>Relatório</h1>

          {status === "done" && (
            <div style={{ marginTop: 14 }}>
              <div style={{ border: "1px solid #222", borderRadius: 14, overflow: "hidden", background: "#0f0f0f" }}>
                <iframe
                  title="Relatório"
                  srcDoc={displayHtml}
                  style={{ width: "100%", height: "70vh", border: 0 }}
                />
              </div>

              {!isPaid && (
                <div style={{ marginTop: 14, color: "#aaa" }}>
                  🔒 Para ver os detalhes completos:
                  <div style={{ marginTop: 10 }}>
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
                      🔒 Desbloquear por {UNLOCK_PRICE_LABEL}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ===========================
   PAYWALL COM PREÇO DINÂMICO
=========================== */
function applyPaywall(html) {
  if (!html) return html;

  const price =
    (3990 / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    html +
    `
<div style="margin-top:16px;border:1px solid #2a2a2a;border-radius:14px;padding:16px;background:#0f0f0f;color:#fff;">
  🔒 Conteúdo bloqueado<br/>
  Desbloqueie por <b style="color:#d4af37;">${price}</b>
</div>`
  );
}
