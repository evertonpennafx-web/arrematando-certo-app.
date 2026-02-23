import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function FreeTastingPage() {
  const [urlPdf, setUrlPdf] = useState("https://www.arrematandocerto.com.br/edital%206%20folhas.pdf");
  const [editalLink, setEditalLink] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    console.log("✅ FreeTastingPage vAPI carregado");
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
    if (!looksLikePdfUrl(urlPdf)) return setStatusMsg("Esse link não parece ser um PDF.");

    if (!nome.trim()) return setStatusMsg("Informe seu nome.");
    if (!whatsapp.trim()) return setStatusMsg("Informe seu WhatsApp.");
    if (!email.trim()) return setStatusMsg("Informe seu email.");

    const whats = digitsOnly(whatsapp);
    if (whats.length < 10) return setStatusMsg("WhatsApp inválido.");
    if (!email.includes("@")) return setStatusMsg("Email inválido.");

    setLoading(true);

    try {
      setStatusMsg("Gerando prévia…");

      const pdf = urlPdf.trim();
      const leilao = editalLink.trim() || "não informado";

      const res = await callCreatePreview({
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
        setStatusMsg("Prévia criada, mas não abriu automaticamente.");
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
          {/* TITULO (mais direto pra decisão) */}
          <h1 className="text-3xl font-extrabold">
            Antes de dar qualquer lance, veja se esse imóvel tem dívida, processo ou risco escondido
          </h1>

          {/* SUBTITULO (clareza + velocidade) */}
          <p className="mt-2 text-white/70">
            A IA analisa o edital e te entrega um relatório claro com <b>alertas</b> e <b>conclusão</b> em poucos minutos.
          </p>

          {/* BENEFÍCIOS (mais fortes) */}
          <div className="mt-4 text-white/70">
            ✔ descobre dívidas ocultas e responsabilidades do arrematante
            <br />
            ✔ identifica risco jurídico, ocupação e pontos críticos do edital
            <br />
            ✔ mostra se vale a pena ou se pode virar prejuízo
          </div>

          {/* CTA DEMO (remove fricção) */}
          <div className="mt-5">
            <a
              href="/demo-relatorio.html"
              className="block w-full rounded-xl bg-white px-6 py-4 text-center font-extrabold text-black"
            >
              👀 Ver um exemplo real do relatório (10 segundos)
            </a>
            <div className="mt-2 text-xs text-white/50">Dica: veja a demo primeiro e depois analise o seu.</div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80">🔗 Link direto do PDF do edital</label>

              <input
                value={urlPdf}
                onChange={(e) => setUrlPdf(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />

              {/* TEXTO QUE AUMENTA ENVIO */}
              <div className="mt-2 text-xs text-white/50">
                Já deixamos um <b>edital de exemplo</b> preenchido aí em cima. Se quiser, pode <b>clicar direto em gerar</b>.
              </div>

              <div className="mt-2 text-xs text-white/40">
                Como pegar: no site do leilão, clique em <b>“Edital (PDF)”</b> / <b>“Baixar edital”</b>, abra o PDF e copie o link do navegador.
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80">🌐 Link do leilão (opcional)</label>
              <input
                value={editalLink}
                onChange={(e) => setEditalLink(e.target.value)}
                placeholder="Se tiver, cole o link do lote (ajuda a análise, mas não é obrigatório)"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              />
            </div>

            <div>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              />
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              />
            </div>

            {/* BOTÃO PRINCIPAL (mais decisão) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#d4af37] px-6 py-4 text-center font-extrabold text-black disabled:opacity-60"
            >
              {loading ? "Gerando…" : "Ver se meu imóvel tem risco antes do lance"}
            </button>

            {/* MICRO-COPY (reduz objeção) */}
            <div className="text-xs text-white/50">
              🔒 Dados protegidos • ⚡ Resultado em poucos minutos • ✅ Não enviamos spam
            </div>

            {statusMsg ? <div className="text-sm text-white/70">{statusMsg}</div> : null}
          </form>
        </div>
      </div>
    </Layout>
  );
}
