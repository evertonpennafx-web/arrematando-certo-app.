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
          <h1 className="text-3xl font-extrabold">
            Descubra em 2 minutos se um imóvel de leilão tem riscos e dívidas ocultas
          </h1>

          <p className="mt-2 text-white/70">Antes de arriscar seu dinheiro no lance.</p>

          <div className="mt-4 text-white/70">
            ✔ análise automática em minutos
            <br />
            ✔ não precisa entender jurídico
            <br />
            ✔ você recebe um relatório claro (risco, alertas e conclusão)
          </div>

          {/* CTA DEMO */}
          <div className="mt-6">
            <a
              href="/demo-relatorio.html"
              className="block w-full rounded-2xl border border-white/10 bg-white px-6 py-5 text-center font-extrabold text-black"
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.35)" }}
            >
              👀 VER UM RELATÓRIO AGORA (DEMO REAL)
              <div className="mt-1 text-sm font-semibold text-black/70">
                (leva 10 segundos — sem preencher nada)
              </div>
            </a>

            <div className="mt-3 text-xs text-white/40">Dica: veja a demo primeiro e depois analise o seu edital.</div>
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

              <div className="mt-2 text-xs text-white/50">
                Você pode usar QUALQUER edital só pra testar. Nem precisa ser o imóvel real.
              </div>

              <div className="mt-2 text-xs text-white/40">
                Como pegar: no site do leilão, clique em “Edital (PDF)”/“Baixar edital”, abra o PDF e copie o link do navegador.
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80">🌐 Link do leilão (opcional)</label>
              <input
                value={editalLink}
                onChange={(e) => setEditalLink(e.target.value)}
                placeholder="Ex: https://... (página do leilão)"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#d4af37] px-6 py-4 text-center font-extrabold text-black disabled:opacity-60"
            >
              {loading ? "Gerando…" : "GERAR RELATÓRIO GRÁTIS AGORA (leva menos de 2 minutos)"}
            </button>

            {statusMsg ? <div className="text-sm text-white/70">{statusMsg}</div> : null}

            {/* ✅ ÚLTIMO AJUSTE: frase de risco (abaixo do botão) */}
            <div className="text-xs text-white/50">
              ⚠️ Leilão não perdoa erro: um item oculto no edital pode virar prejuízo de milhares.
            </div>

            <div className="text-xs text-white/40">* Prévia automática. Não substitui análise jurídica.</div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
