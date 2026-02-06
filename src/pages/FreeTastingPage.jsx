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

  const BUCKET = "edital-pdfs"; // troque se seu bucket tiver outro nome

  function digitsOnly(v) {
    return String(v || "").replace(/\D/g, "");
  }

  async function uploadPdfToStorage(pdfFile) {
    const path = `previews/${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, pdfFile, {
      contentType: "application/pdf",
      upsert: false,
    });

    if (upErr) throw new Error(`Falha ao enviar PDF: ${upErr.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error("Não foi possível obter URL pública do PDF.");

    return data.publicUrl;
  }

  async function callCreatePreview(payload) {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !ANON) {
      throw new Error("Env faltando: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
    }

    const resp = await fetch(`${SUPABASE_URL}/functions/v1/create_preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        authorization: `Bearer ${ANON}`,
      },
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

    // ✅ todos obrigatórios
    if (!file) return setStatusMsg("Envie o PDF do edital.");
    if (!editalLink.trim()) return setStatusMsg("Informe o link do leilão.");
    if (!nome.trim()) return setStatusMsg("Informe seu nome.");
    if (!whatsapp.trim()) return setStatusMsg("Informe seu WhatsApp.");
    if (!email.trim()) return setStatusMsg("Informe seu email.");

    const whats = digitsOnly(whatsapp);
    if (whats.length < 10) return setStatusMsg("WhatsApp inválido. Ex: (11) 99999-9999.");
    if (!email.includes("@") || email.length < 6) return setStatusMsg("Email inválido.");

    setLoading(true);

    try {
      setStatusMsg("Enviando PDF…");
      const url_pdf = await uploadPdfToStorage(file);

      setStatusMsg("Gerando prévia…");
      const res = await callCreatePreview({
        url_pdf,
        edital_link: editalLink.trim(),
        nome: nome.trim(),
        whatsapp: whats,
        email: email.trim(),
      });

      const reportUrl =
        res?.report_url || `/relatorio?id=${res.id}&t=${res.access_token || res.token}`;

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
            </div>

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
