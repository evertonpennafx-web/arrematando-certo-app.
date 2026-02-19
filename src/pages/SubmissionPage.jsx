import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/* 🔥 COLOQUE AQUI OS LINKS DA KIWIFY */
const CHECKOUTS = {
  express: "COLE_LINK_KIWIFY_MENSAL",
  express_annual: "COLE_LINK_KIWIFY_ANUAL",
  standard: "COLE_LINK_KIWIFY_REVISAO"
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

      express: {
        title: "Plano Investidor (Express)",
        price: "R$ 97,00 / mês",
        bullets: [
          "Até 4 análises por mês (1 por semana)",
          "Relatório express em linguagem clara",
          "Prioridade no atendimento",
          "Prazo até 24h"
        ]
      },

      express_annual: {
        title: "Plano Investidor (Anual)",
        price: "R$ 970,00 / ano",
        bullets: [
          "Até 4 análises por mês (48/ano)",
          "2 meses grátis no anual",
          "Prioridade no atendimento",
          "Prazo até 24h"
        ]
      },

      standard: {
        title: "Revisão Profissional",
        price: "R$ 497,00 pagamento único",
        bullets: [
          "IA + revisão humana",
          "Riscos, ônus e custos destacados",
          "Checklist antes do lance",
          "Entrega até 48h"
        ]
      }

    };

    return plans[plan] || plans.standard;

  }, [plan]);


  const nomeRef = useRef(null);
  const whatsappRef = useRef(null);
  const emailRef = useRef(null);
  const linkRef = useRef(null);

  function handleSubmit(e) {

    e.preventDefault();

    const nome = nomeRef.current?.value.trim();
    const whatsapp = whatsappRef.current?.value.trim();
    const email = emailRef.current?.value.trim();
    const link = linkRef.current?.value.trim();

    if (!nome || !whatsapp || !email) {
      alert("Preencha Nome, WhatsApp e Email.");
      return;
    }

    if (plan === "standard" && !link) {
      alert("Informe o link do leilão.");
      return;
    }

    setLoading(true);

    const lead = {
      nome,
      whatsapp,
      email,
      link,
      plan,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("ac_lead", JSON.stringify(lead));
    } catch (_) {}

    const checkout = CHECKOUTS[plan];

    if (!checkout) {
      alert("Checkout não configurado.");
      return;
    }

    window.location.href = checkout;

  }


  return (
    <div style={pageStyle}>

      <div style={containerStyle}>

        <Link to="/" style={backStyle}>← Voltar</Link>

        <h1 style={h1Style}>{planInfo.title}</h1>

        <p style={subStyle}>{planInfo.price}</p>


        <div style={gridStyle}>

          {/* BENEFÍCIOS */}

          <div style={cardStyle}>
            <h3 style={h3Style}>O que você recebe</h3>

            <ul style={ulStyle}>
              {planInfo.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>

            <p style={hintStyle}>
              * A decisão de participação no leilão é de responsabilidade do comprador.
            </p>

          </div>


          {/* FORM */}

          <form onSubmit={handleSubmit} style={cardStyle}>

            <h3 style={h3Style}>Preencha para continuar</h3>

            <div style={{ display: "grid", gap: 10 }}>

              <input ref={nomeRef} placeholder="Seu nome" style={inputStyle}/>
              <input ref={whatsappRef} placeholder="WhatsApp" style={inputStyle}/>
              <input ref={emailRef} placeholder="Email" style={inputStyle}/>

              {plan === "standard" && (
                <input
                  ref={linkRef}
                  placeholder="Link do leilão (obrigatório)"
                  style={inputStyle}
                />
              )}

              <button disabled={loading} style={buttonStyle(loading)}>
                {loading ? "Abrindo checkout..." : "Ir para pagamento"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

/* STYLES */

const pageStyle = { minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 };
const containerStyle = { maxWidth: 1000, margin: "0 auto" };
const backStyle = { color: "#bbb", textDecoration: "none" };
const h1Style = { margin: "12px 0 6px 0" };
const subStyle = { opacity: 0.85, marginTop: 0 };

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 20
};

const cardStyle = {
  border: "1px solid #222",
  borderRadius: 14,
  padding: 20,
  background: "#111"
};

const h3Style = { marginTop: 0 };

const ulStyle = {
  lineHeight: 1.9,
  margin: 0,
  paddingLeft: 18
};

const inputStyle = {
  padding: "12px",
  borderRadius: 12,
  border: "1px solid #222",
  background: "#0b0b0b",
  color: "#fff"
};

const buttonStyle = (loading) => ({
  padding: "14px",
  borderRadius: 12,
  border: "none",
  fontWeight: 900,
  cursor: loading ? "not-allowed" : "pointer",
  background: "#caa63a",
  color: "#000"
});

const hintStyle = { marginTop: 20, opacity: 0.7, fontSize: 13 };
