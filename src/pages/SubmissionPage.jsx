import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const WHATSAPP_NUMBER = "5511932087649"; // seu WhatsApp (Brasil)

export default function SubmissionPage() {
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get("plan") || "standard").toLowerCase();

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

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    const n = nome.trim();
    const w = whatsapp.trim();
    const em = email.trim();

    if (!n || !w) {
      alert("Preencha pelo menos Nome e WhatsApp.");
      return;
    }

    setLoading(true);

    const lead = {
      nome: n,
      whatsapp: w,
      email: em,
      plan,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("ac_lead", JSON.stringify(lead));
    } catch (_) {
      // se o navegador bloquear localStorage, segue o fluxo mesmo assim
    }

    const text = encodeURIComponent(
      `Olá! Quero assinar o ${planInfo.title} (${planInfo.price}).\n\n` +
        `Nome: ${lead.nome}\n` +
        `WhatsApp: ${lead.whatsapp}\n` +
        `Email: ${lead.email || "-"}\n\n` +
        `Quero liberar análises ilimitadas.`
    );

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    // abre no mesmo tab (mais confiável em mobile/desktop)
    window.location.assign(url);
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <Link to="/" style={backStyle}>← Voltar</Link>

        <h1 style={h1Style}>{planInfo.title}</h1>
        <p style={subStyle}>
          {planInfo.price} • Plano selecionado: <b>{plan}</b>
        </p>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h3 style={h3Style}>O que você recebe</h3>
            <ul style={ulStyle}>
              {planInfo.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} style={cardStyle}>
            <h3 style={h3Style}>Preencha para liberar o acesso</h3>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                name="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                placeholder="Seu nome completo"
                style={inputStyle}
              />

              <input
                name="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                autoComplete="tel"
                placeholder="WhatsApp (DDD + número)"
                style={inputStyle}
              />

              <input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="E-mail (opcional)"
                style={inputStyle}
              />

              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? "Abrindo WhatsApp..." : "Falar no WhatsApp e liberar acesso"}
              </button>

              <p style={hintStyle}>
                MVP: por enquanto a assinatura é validada pelo WhatsApp. Depois podemos plugar Stripe.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* styles */
const pageStyle = {
  minHeight: "100vh",
  background: "#0b0b0b",
  color: "#fff",
  padding: 24,
};

const containerStyle = {
  maxWidth: 900,
  margin: "0 auto",
};

const backStyle = {
  color: "#bbb",
  textDecoration: "none",
};

const h1Style = {
  margin: "12px 0 6px 0",
};

const subStyle = {
  opacity: 0.85,
  marginTop: 0,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 16,
  marginTop: 16,
};

const cardStyle = {
  border: "1px solid #222",
  borderRadius: 14,
  padding: 16,
  background: "#111",
};

const h3Style = {
  marginTop: 0,
};

const ulStyle = {
  lineHeight: 1.8,
  margin: 0,
  paddingLeft: 18,
};

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

const hintStyle = {
  margin: 0,
  opacity: 0.7,
  fontSize: 13,
};
