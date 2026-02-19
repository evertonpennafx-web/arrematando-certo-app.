import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// ✅ AJUSTE ESTE IMPORT se necessário (depende do seu projeto)
// exemplos comuns:
// import { supabase } from "@/integrations/supabase/client";
// import { supabase } from "@/lib/supabaseClient";
import { supabase } from "@/lib/supabase";

const KIWIFY_LINKS = {
  express: "https://pay.kiwify.com.br/JS51nmm",        // mensal 97
  express_annual: "https://pay.kiwify.com.br/vc57F2N", // anual 997
  standard: "https://pay.kiwify.com.br/5urVOdf",       // revisão profissional 497
};

export default function SubmissionPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const plan = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("plan") || "standard").toLowerCase();
  }, [location.search]);

  const planInfo = useMemo(() => {
    const plans = {
      standard: {
        title: "Revisão Profissional",
        priceLabel: "R$ 497,00 (pagamento único)",
        cta: "Ir para pagamento",
        bullets: [
          "IA + revisão humana dos pontos críticos",
          "Riscos, ônus e custos destacados",
          "Checklist completo antes do lance",
          "Entrega em até 48h",
        ],
        requireLinkLeilao: true,
      },
      express: {
        title: "Plano Investidor (Express)",
        priceLabel: "R$ 97,00 /mês",
        cta: "Ir para pagamento",
        bullets: [
          "Até 4 análises por mês (1 por semana)",
          "Relatório express em linguagem clara",
          "Prioridade no atendimento",
          "Prazo: até 24h",
        ],
        requireLinkLeilao: false,
      },
      express_annual: {
        title: "Plano Investidor (Anual)",
        priceLabel: "R$ 997,00 /ano",
        cta: "Ir para pagamento",
        bullets: [
          "Até 4 análises por mês (48/ano)",
          "Pagamento único anual",
          "2 meses grátis no anual",
          "Prioridade no atendimento",
        ],
        requireLinkLeilao: false,
      },
    };

    // aceita variações que podem vir da home
    if (plan === "expressannual" || plan === "express-anual") return plans.express_annual;
    if (plan === "express_annual") return plans.express_annual;

    return plans[plan] || plans.standard;
  }, [plan]);

  const checkoutUrl = useMemo(() => {
    if (plan === "express_annual" || plan === "expressannual" || plan === "express-anual") return KIWIFY_LINKS.express_annual;
    if (plan === "express") return KIWIFY_LINKS.express;
    return KIWIFY_LINKS.standard;
  }, [plan]);

  // ✅ Inputs uncontrolled
  const nomeRef = useRef(null);
  const whatsappRef = useRef(null);
  const emailRef = useRef(null);
  const linkLeilaoRef = useRef(null);

  async function saveLeadToSupabase(lead) {
    // Se supabase não estiver configurado/importado corretamente, falha silenciosa
    if (!supabase || !supabase.from) {
      console.warn("Supabase client not found/imported.");
      return { ok: false };
    }

    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([lead])
        .select("id")
        .single();

      if (error) {
        console.warn("Lead save failed:", error.message);
        return { ok: false };
      }

      console.log("Lead salvo no Supabase! id:", data?.id);
      return { ok: true, id: data?.id };
    } catch (e) {
      console.warn("Lead save exception:", e?.message || e);
      return { ok: false };
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nome = (nomeRef.current?.value || "").trim();
    const whatsapp = (whatsappRef.current?.value || "").trim();
    const email = (emailRef.current?.value || "").trim();
    const link_leilao = (linkLeilaoRef.current?.value || "").trim();

    // ✅ validação mínima (sem alert feio)
    if (!nome || !whatsapp) {
      // pode trocar por toast se você tiver
      return;
    }
    if (planInfo.requireLinkLeilao && !link_leilao) {
      return;
    }

    setLoading(true);

    // lead payload
    const lead = {
      source: "submission",
      plan: plan,
      nome,
      whatsapp,
      email: email || null,
      link_leilao: planInfo.requireLinkLeilao ? link_leilao : null,
    };

    // tenta salvar (se falhar, não mostra pro cliente)
    await saveLeadToSupabase(lead);

    // também salva local (backup)
    try {
      localStorage.setItem("ac_lead", JSON.stringify({ ...lead, createdAt: new Date().toISOString() }));
    } catch (_) {}

    // ✅ Redireciona para a Kiwify (sempre)
    window.location.assign(checkoutUrl);
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <Link to="/" style={backStyle}>← Voltar</Link>

        <h1 style={h1Style}>{planInfo.title}</h1>
        <p style={subStyle}>{planInfo.priceLabel} • Plano: <b>{plan}</b></p>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h3 style={h3Style}>O que você recebe</h3>
            <ul style={ulStyle}>
              {planInfo.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <p style={miniHintStyle}>* A decisão de participação no leilão é de responsabilidade do comprador.</p>
          </div>

          <form onSubmit={handleSubmit} style={cardStyle}>
            <h3 style={h3Style}>Preencha para continuar</h3>
            <p style={hintStyle}>Você será direcionado ao checkout para concluir o pagamento.</p>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                ref={nomeRef}
                name="nome"
                autoComplete="name"
                placeholder="Seu nome completo *"
                style={inputStyle}
              />

              <input
                ref={whatsappRef}
                name="whatsapp"
                autoComplete="tel"
                placeholder="WhatsApp (DDD + número) *"
                style={inputStyle}
              />

              <input
                ref={emailRef}
                name="email"
                autoComplete="email"
                placeholder="E-mail (opcional)"
                style={inputStyle}
              />

              {planInfo.requireLinkLeilao && (
                <input
                  ref={linkLeilaoRef}
                  name="link_leilao"
                  placeholder="Link do leilão (obrigatório) *"
                  style={inputStyle}
                />
              )}

              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? "Redirecionando..." : planInfo.cta}
              </button>

              <p style={footStyle}>
                Ao continuar, você será direcionado para a página segura de pagamento (Kiwify).
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* styles */
const pageStyle = { minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 };
const containerStyle = { maxWidth: 980, margin: "0 auto" };
const backStyle = { color: "#bbb", textDecoration: "none" };
const h1Style = { margin: "12px 0 6px 0" };
const subStyle = { opacity: 0.85, marginTop: 0 };
const gridStyle = { display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16 };
const cardStyle = { border: "1px solid #222", borderRadius: 14, padding: 16, background: "#111" };
const h3Style = { marginTop: 0 };
const ulStyle = { lineHeight: 1.8, margin: 0, paddingLeft: 18 };
const inputStyle = {
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #222",
  background: "#0b0b0b",
  color: "#fff",
  outline: "none",
};
const buttonStyle = (loading) => ({
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  fontWeight: 900,
  cursor: loading ? "not-allowed" : "pointer",
  background: "#d4af37",
  color: "#000",
});
const hintStyle = { margin: "6px 0 12px 0", opacity: 0.7, fontSize: 13 };
const miniHintStyle = { marginTop: 10, opacity: 0.6, fontSize: 12 };
const footStyle = { margin: 0, opacity: 0.6, fontSize: 12 };
