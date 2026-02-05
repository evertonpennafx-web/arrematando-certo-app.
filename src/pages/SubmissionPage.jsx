import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const WHATSAPP_NUMBER = "5511932087649";

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
        title: "Plano Standard",
        price: "R$ 49/mês",
        bullets: ["Análises ilimitadas", "Checklist completo", "Relatório rápido"],
      },
      express: {
        title: "Plano Express",
        price: "R$ 97/mês",
        bullets: ["Análises ilimitadas", "Prioridade no atendimento", "Suporte para dúvidas do edital"],
      },
    };
    return plans[plan] || plans.standard;
  }, [plan]);

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
      plan,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("ac_lead", JSON.stringify(lead));
    } catch (_) {}

    const text = encodeURIComponent(
      `Olá! Quero assinar o ${planInfo.title} (${planInfo.price}).\n\n` +
        `Nome: ${lead.nome}\n` +
        `WhatsApp: ${lead.whatsapp}\n` +
        `Email: ${lead.email || "-"}\n\n` +
        `Quero liberar análises ilimitadas.`
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
          {planInfo.price} • Plano: <b>{plan}</b>
        </p>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h3 style={h3Style}>O que você recebe</h3>
            <ul style={ulStyle}>
              {planInfo.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>

          <form onSubmit={handleSubmit} style={cardStyle}>
            <h3 style={h3Style}>Preencha para liberar o acesso</h3>

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
                {loading ? "Abrindo WhatsApp..." : "Falar no WhatsApp e liberar acesso"}
              </button>

              <p style={hintStyle}>
                MVP: validação por WhatsApp. Depois pluga pagamento.
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
