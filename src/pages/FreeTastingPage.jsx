import React, { useState } from "react";
import Layout from "@/components/Layout";
import { assertSupabase } from "@/lib/supabase";

export default function FreeTastingPage() {
  const [urlPdf, setUrlPdf] = useState("");
  const [editalLink, setEditalLink] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okLink, setOkLink] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOkLink("");

    if (!urlPdf.trim()) {
      setError("Cole a URL do PDF para continuar.");
      return;
    }

    setLoading(true);

    try {
      // garante envs
      assertSupabase();

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/create_preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON,
          authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({
          url_pdf: urlPdf.trim(),
          edital_link: editalLink.trim() || null,
          nome: nome.trim() || null,
          email: email.trim() || null,
          whatsapp: whatsapp.trim() || null,
        }),
      });

      const payload = await resp.json().catch(() => null);

      if (!resp.ok || !payload?.ok) {
        throw new Error(payload?.error || `Falha (HTTP ${resp.status})`);
      }

      // report_url vem tipo "/relatorio?id=...&t=..."
      const reportUrl = payload.report_url || "";
      if (!reportUrl) throw new Error("Relatório não retornado.");

      setOkLink(reportUrl);
      // já redireciona
      window.location.href = reportUrl;
    } catch (e2) {
      setError(String(e2?.message || "Erro ao criar preview."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div style={{ minHeight: "70vh", display: "flex", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ width: "100%", maxWidth: 820, background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
          <h1 style={{ margin: 0, color: "#fff" }}>Degustação Gratuita</h1>
          <p style={{ color: "#aaa", marginTop: 8 }}>
            Cole a <b>URL do PDF</b> do edital e gere uma prévia automática.
          </p>

          <form onSubmit={onSubmit} style={{ marginTop: 14, display: "grid", gap: 12 }}>
            <input
              value={urlPdf}
              onChange={(e) => setUrlPdf(e.target.value)}
              placeholder="URL do PDF (obrigatório)"
              style={{ padding: 12, borderRadius: 12, border: "1px solid #222", background: "#0f0f0f", color: "#fff" }}
            />
            <input
              value={editalLink}
              onChange={(e) => setEditalLink(e.target.value)}
              placeholder="Link do leilão (opcional)"
              style={{ padding: 12, borderRadius: 12, border: "1px solid #222", background: "#0f0f0f", color: "#fff" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome (opcional)"
                style={{ padding: 12, borderRadius: 12, border: "1px solid #222", background: "#0f0f0f", color: "#fff" }}
              />
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (opcional)"
                style={{ padding: 12, borderRadius: 12, border: "1px solid #222", background: "#0f0f0f", color: "#fff" }}
              />
            </div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (opcional)"
              style={{ padding: 12, borderRadius: 12, border: "1px solid #222", background: "#0f0f0f", color: "#fff" }}
            />

            {error && (
              <div style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0f0f0f", color: "#ffb4b4" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: 12,
                borderRadius: 12,
                border: 0,
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
                background: "#d4af37",
                color: "#111",
              }}
            >
              {loading ? "Gerando…" : "Gerar Relatório"}
            </button>

            {okLink && (
              <a href={okLink} style={{ color: "#d4af37", fontWeight: 900 }}>
                Abrir relatório
              </a>
            )}

            <p style={{ color: "#777", marginTop: 8, fontSize: 13 }}>
              * Prévia automática. Não substitui análise jurídica.
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
