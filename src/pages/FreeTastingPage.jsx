import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import customSupabaseClient from "@/lib/customSupabaseClient";

export default function FreeTastingPage() {
  const supabase = useMemo(() => customSupabaseClient, []);
  const [file, setFile] = useState(null);

  const [editalLink, setEditalLink] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // ⚠️ Troque se o nome do seu bucket for outro
  const BUCKET = "edital-pdfs";

  function normalizeWhatsApp(v) {
    // mantém só dígitos
    const digits = String(v || "").replace(/\D/g, "");
    return digits;
  }

  async function uploadPdfToStorage(pdfFile) {
    const ext = (pdfFile.name.split(".").pop() || "pdf").toLowerCase();
    const safeExt = ext === "pdf" ? "pdf" : "pdf";
    const path = `previews/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, pdfFile, {
      contentType: "application/pdf",
      upsert: false,
    });

    if (upErr) {
      throw new Error(`Falha ao enviar PDF: ${upErr.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      throw new Error("Não foi possível obter URL pública do PDF.");
    }

    return publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMsg("");

    // ✅ Validação: todos obrigatórios
    if (!file) return setStatusMsg("Envie o PDF do edital.");
    if (!editalLink.trim()) return setStatusMsg("Informe o link do leilão.");
    if (!nome.trim()) return setStatusMsg("Informe seu nome.");
    if (!whatsapp.trim()) return setStatusMsg("Informe seu WhatsApp.");
    if (!email.trim()) return setStatusMsg("Informe seu email.");

    const whats = normalizeWhatsApp(whatsapp);
    if (whats.length < 10) return setStatusMsg("WhatsApp inválido. Ex: (11) 99999-9999.");

    // email básico (HTML já valida, mas reforça)
    if (!email.includes("@") || email.length < 6) return setStatusMsg("Email inválido.");

    setLoading(true);

    try {
      // 1) upload do PDF
      setStatusMsg("Enviando PDF…");
      const url_pdf = await uploadPdfToStorage(file);

      // 2) chama endpoint do Vercel (server-side) para criar preview
      // ⚠️ Se seu endpoint tiver outro caminho, troque aqui
      setStatusMsg("Gerando prévia…");

      const resp = await fetch("/api/create-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url_pdf,
          edital_link: editalLink.trim(),
          nome: nome.trim(),
          whatsapp: whats,
          email: email.trim(),
        }),
      });

      const payload = await resp.json().catch(() => ({}));

      if (!resp.ok || !payload?.ok) {
        throw new Error(payload?.error || "Falha ao criar prévia.");
      }

      // 3) redireciona para relatório
      const reportUrl =
        payload?.report_url ||
        `/relatorio?id=${payload.id}&t=${payload.access_token || payload.token}`;

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
            Envie o <b>PDF do edital</b> + seus dados para gerar uma{" "}
            <b>prévia automática</b>.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* PDF obrigatório */}
            <div>
              <label className="block text-sm font-semibold text-white/80">
                PDF do edital <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
              <div className="mt-2 text-xs text-white/50">Formato: PDF.</div>
            </div>

            {/* Link do leilão obrigatório */}
            <div>
              <label className="block text-sm font-semibold text-white/80">
                Link do leilão <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                value={editalLink}
                onChange={(e) => setEditalLink(e.target.value)}
                placeholder="Cole o link da página do leilão"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            {/* Nome obrigatório */}
            <div>
              <label className="block text-sm font-semibold text-white/80">
                Nome <span className="text-[#d4af37]">(obrigatório)</span>
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            {/* WhatsApp obrigatório */}
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
              <div className="mt-2 text-xs text-white/50">
                Dica: pode digitar com ou sem parênteses. A gente normaliza.
              </div>
            </div>

            {/* Email obrigatório */}
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
              {loading ? "Gerando…" : "Gerar Relatório"}
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
