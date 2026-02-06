import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function FreeTastingPage() {
  const [urlPdf, setUrlPdf] = useState("");
  const [editalLink, setEditalLink] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // ✅ Marcador pra você ter certeza que a versão certa subiu
  useEffect(() => {
    console.log("✅ FreeTastingPage vAPI (chamando /api/create_preview) carregado");
  }, []);

  function digitsOnly(v) {
    return String(v || "").replace(/\D/g, "");
  }

  function looksLikePdfUrl(u) {
    const s = String(u || "").trim().toLowerCase();
    return s.includes(".pdf");
  }

  async function callCreatePreview(payload) {
    const resp = await fetch("/api/create_preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data?.ok) {
      throw new Error(data?.error || "Falha ao criar prévia.");
    }
    return data;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMsg("");

    if (!urlPdf.trim()) return setStatusMsg("Cole o link direto do PDF do edital.");
    if (!looksLikePdfUrl(urlPdf))
      return setStatusMsg(
        "Parece que esse link não é do PDF. Abra o edital no site do leilão, copie o link que abre o PDF (geralmente contém .pdf) e cole aqui.",
      );

    if (!editalLink.trim()) return setStatusMsg("Informe o link do leilão.");
    if (!nome.trim()) return setStatusMsg("Informe seu nome.");
    if (!whatsapp.trim()) return setStatusMsg("Informe seu WhatsApp.");
    if (!email.trim()) return setStatusMsg("Informe seu email.");

    const whats = digitsOnly(whatsapp);
    if (whats.length < 10) return setStatusMsg("WhatsApp inválido. Ex: (11) 99999-9999.");
    if (!email.includes("@") || email.length < 6) return setStatusMsg("Email inválido.");

    setLoading(true);

    try {
      setStatusMsg("Gerando prévia…");

      const pdf = urlPdf.trim();
      const leilao = editalLink.trim();

      const res = await callCreatePreview({
        // compatível antigo + novo
        url_pdf: pdf,
        edital_link: leilao,
        pdf_url: pdf,
        leilao_url: leilao,
        nome: nome.trim(),
        whatsapp: whats,
        email: email.trim(),
      });

      const id = res?.id;
      const token = res?.access_token || res?.token || res?.t;

      const reportUrl =
        res?.report_url ||
        (id && token ? `/relatorio?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}` : null);

      if (!reportUrl) {
        setStatusMsg("Prévia criada, mas não consegui abrir o relatório automaticamente.");
        return;
      }

      window.location.href = reportUrl;
    } catch (err) {
      setStatusMsg(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h1 className="text-2xl font-bold">Degustação Gratuita</h1>

          <p className="mt-2 text-white/70">
            Cole o <b>link direto do PDF do edital</b> para gerar uma <b>prévia automática</b>.
            <br />
            ⚠️ <b>Não é upload de arquivo.</b> É só copiar o link do PDF que abre no navegador
            (normalmente contém <code>.pdf</code>).
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80">
                🔗 Link direto do PDF do edital{" "}
                <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                value={urlPdf}
                onChange={(e) => setUrlPdf(e.target.value)}
                placeholder="Ex: https://site-do-leilao.com.br/editais/edital123.pdf"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <div className="mt-2 text-xs text-white/50">
                Como pegar: no site do leilão, clique em <b>“Edital (PDF)”</b> ou{" "}
                <b>“Baixar edital”</b>, abra o PDF e copie o link do navegador.
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80">
                🌐 Link do leilão <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                value={editalLink}
                onChange={(e) => setEditalLink(e.target.value)}
                placeholder="Ex: https://... (página do leilão)"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <div className="mt-2 text-xs text-white/50">
                Cole o link da página onde o imóvel/lote está anunciado.
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80">
                Nome <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80">
                WhatsApp <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80">
                Email <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#d4af37] px-6 py-4 text-center font-extrabold text-black disabled:opacity-60"
            >
              {loading ? "Gerando…" : "Gerar prévia gratuita do relatório"}
            </button>

            {statusMsg ? <div className="text-sm text-white/70">{statusMsg}</div> : null}

            <div className="text-xs text-white/50">
              * Prévia automática. Não substitui análise jurídica.
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
