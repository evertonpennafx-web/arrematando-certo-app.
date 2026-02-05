import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const WHATSAPP_NUMBER = "5511932087649";

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
    if (!nome.trim() || !whatsapp.trim()) {
      alert("Preencha pelo menos Nome e WhatsApp.");
      return;
    }

    setLoading(true);

    // MVP: salvar lead local (custo zero) – depois você manda pro Supabase
    const lead = {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      plan,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("ac_lead", JSON.stringify(lead));

    // CTA: WhatsApp (validação rápida + venda)
    const text = encodeURIComponent(
      `Olá! Quero assinar o ${planInfo.title} (${planInfo.price}).\n\nNome: ${lead.nome}\nWhatsApp: ${lead.whatsapp}\nEmail: ${lead.email || "-"}\n\nQuero liberar análises ilimitadas.`
    );

    // abre WhatsApp
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link to="/" style={{ color: "#bbb", textDecoration: "none" }}>← Voltar</Link>

        <h1 style={{ margin: "12px 0 6px 0" }}>{planInfo.title}</h1>
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          {planInfo.price} • Selecionei o plano via URL: <b>{plan}</b>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16 }}>
          <div style={{ border: "1px solid #222", borderRadius: 14, padding: 16, background: "#111" }}>
            <h3 style={{ marginTop: 0 }}>O que você recebe</h3>
            <ul style={{ lineHeight: 1.8, margin: 0, paddingLeft: 18 }}>
              {planInfo.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} style={{ border: "1px solid #222", borderRadius: 14, padding: 16, background: "#111" }}>
            <h3 style={{ marginTop: 0 }}>Preencha para liberar o acesso</h3>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                style={inputStyle}
              />
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (DDD + número)"
                style={inputStyle}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail (opcional)"
                style={inputStyle}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "none",
                  fontWeight: 900,
                  cursor: loading ? "not-allowed" : "pointer",
                  background: "#22c55e",
                  color: "#000",
                }}
              >
                {loading ? "Abrindo WhatsApp..." : "Falar no WhatsApp e liberar acesso"}
              </button>

              <p style={{ margin: 0, opacity: 0.7, fontSize: 13 }}>
                MVP: o pagamento pode vir depois (Stripe). Agora o objetivo é validar demanda e conversão.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #222",
  background: "#0b0b0b",
  color: "#fff",
  outline: "none",
};
