import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { pricingPlans } from "@/lib/stripe";

// ✅ WhatsApp oficial: 11 98341-1251
// Formato wa.me: 55 + DDD + número (sem traços)
const WHATSAPP_NUMBER = "5511983411251";

export default function SubmissionPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // plan pode vir: standard | express | express_annual | premium ...
  const planKey = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("plan") || "standard").toLowerCase();
  }, [location.search]);

  const planInfo = useMemo(() => {
    // Fonte única: pricingPlans
    // Fallback: standard
    const p =
      pricingPlans?.[planKey] ||
      (planKey === "annual" ? pricingPlans?.express_annual : null) ||
      pricingPlans?.standard;

    // Normaliza infos que vamos usar na UI
    const title = p?.name || "Plano";
    const features = Array.isArray(p?.features) ? p.features : [];

    // Texto de preço amigável
    // standard = avulso /análise
    // express = /mês
    // express_annual = /ano
    let priceLabel = "";
    if (planKey === "standard") {
      priceLabel = `R$ ${p?.price || "—"} /análise`;
    } else if (planKey === "express") {
      priceLabel = `R$ ${p?.price || "—"} /mês`;
    } else if (planKey === "express_annual") {
      priceLabel = `R$ ${p?.price || "—"} /ano`;
    } else {
      // fallback genérico
      priceLabel = p?.price ? `R$ ${p.price}` : "Valor sob consulta";
    }

    // Complementos estratégicos (sem prometer ilimitado)
    const bullets =
      planKey === "standard"
        ? [
            "1 análise avulsa do edital",
            "Riscos, ônus e custos destacados",
            "Checklist completo antes do lance",
            "Linguagem clara e objetiva (sem juridiquês)",
          ]
        : planKey === "express"
        ? [
            "3 análises por mês",
            "Prioridade no atendimento",
            "Suporte para dúvidas do edital",
            "Acesso rápido aos relatórios",
          ]
        : planKey === "express_annual"
        ? [
            "3 análises por mês (36/ano)",
            "Prioridade no atendimento",
            "Suporte para dúvidas do edital",
            "Economia no plano anual",
          ]
        : features.length
        ? features
        : ["Detalhes do plano serão confirmados no atendimento."];

    return {
      title,
      priceLabel,
      bullets,
      raw: p,
    };
  }, [planKey]);

  // ✅ Inputs UNCONTROLLED (não perdem foco por re-render)
  const nomeRef = useRef(null);
  const whatsappRef = useRef(null);
  const emailRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();

    const nome = (nomeRef.current?.value || "").trim();
    const whatsapp = (whatsappRef.current?.value || "").trim();
    const email = (emailRef.current?.value || "").trim();

    if (!nome || !whatsapp) {
      alert("Preencha pelo menos Nome e WhatsApp.");
      return;
    }

    setLoading(true);

    const lead = {
      nome,
      whatsapp,
      email,
      plan: planKey,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("ac_lead", JSON.stringify(lead));
    } catch (_) {}

    // Mensagem profissional (sem “ilimitadas”)
    const planSummary =
      planKey === "standard"
        ? "Análise avulsa (1 edital)"
        : planKey === "express"
        ? "Plano Express (3 análises/mês)"
        : planKey === "express_annual"
        ? "Plano Express Anual (3 análises/mês)"
        : planInfo.title;

    const text = encodeURIComponent(
      `Olá! Quero contratar: ${planSummary}.\n` +
        `Preço: ${planInfo.priceLabel}\n\n` +
        `Nome: ${lead.nome}\n` +
        `WhatsApp: ${lead.whatsapp}\n` +
        `E-mail: ${lead.email || "-"}\n\n` +
        `Pode me orientar no próximo passo para liberar o acesso?`
    );

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.location.assign(url);
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <Link to="/" style={backStyle}>← Voltar</Link>

        <h1 style={h1Style}>{planInfo.title}</h1>
        <p style={subStyle}>
          {planInfo.priceLabel} • Plano: <b>{planKey}</b>
        </p>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h3 style={h3Style}>O que você recebe</h3>
            <ul style={ulStyle}>
              {planInfo.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>

          <form onSubmit={handleSubmit} style={cardStyle}>
            <h3 style={h3Style}>Preencha para continuar</h3>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                ref={nomeRef}
                name="nome"
                autoComplete="name"
                placeholder="Seu nome completo"
                style={inputStyle}
              />

              <input
                ref={whatsappRef}
                name="whatsapp"
                autoComplete="tel"
                placeholder="WhatsApp (DDD + número)"
                style={inputStyle}
              />

              <input
                ref={emailRef}
                name="email"
                autoComplete="email"
                placeholder="E-mail (opcional)"
                style={inputStyle}
              />

              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? "Abrindo WhatsApp..." : "Continuar no WhatsApp"}
              </button>

              <p style={hintStyle}>
                Você será direcionado ao WhatsApp para confirmar os dados e liberar o acesso.
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
const containerStyle = { maxWidth: 900, margin: "0 auto" };
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
  background: "#22c55e",
  color: "#000",
});
const hintStyle = { margin: 0, opacity: 0.7, fontSize: 13 };
