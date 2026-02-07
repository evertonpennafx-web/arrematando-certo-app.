import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const KIWIFY_CHECKOUT = "https://pay.kiwify.com.br/UqeERMG";

export default function Resultado() {
  const navigate = useNavigate();

  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("paid") === "true") {
      localStorage.setItem("ac_paid_analysis", "true");
      // opcional: limpa o paid=true da url depois de salvar
      // window.history.replaceState({}, document.title, window.location.pathname);
    }

    setIsPaid(localStorage.getItem("ac_paid_analysis") === "true");
  }, []);

  const raw = localStorage.getItem("ac_ultimo_resultado");
  const data = raw ? safeJson(raw) : null;

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Nenhum relatório encontrado</h1>
          <p style={{ opacity: 0.85 }}>Faça uma análise primeiro.</p>
          <button
            onClick={() => navigate("/analisar")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "#22c55e",
              color: "#000",
              fontWeight: 900
            }}
          >
            Ir para análise
          </button>
        </div>
      </div>
    );
  }

  const {
    resumo,
    riscos,
    checklist,
    perguntas,
    proximo_passo,
    score_risco,
    // campos opcionais (se ainda não existirem, tudo bem)
    dividas_responsabilidades,
    vale_a_pena,
    parecer_final
  } = data;

  const parecer = vale_a_pena || parecer_final || "—";

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link to="/" style={{ color: "#bbb", textDecoration: "none" }}>← Voltar</Link>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Relatório</h1>
          <div style={{ opacity: 0.85 }}>
            Score de risco: <b>{typeof score_risco === "number" ? score_risco : "-"}</b>
          </div>
        </div>

        {/* ✅ GRATUITO */}
        <Card title="Resumo" content={resumo} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 14 }}>
          <ListCard title="Checklist de documentos" items={checklist} />
          <ListCard title="Perguntas que você deve fazer" items={perguntas} />
        </div>

        <Card title="Próximo passo recomendado" content={proximo_passo} />

        {/* 🔒 BLOQUEIO / DESBLOQUEIO */}
        {!isPaid ? (
          <Paywall />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 14 }}>
            {/* 🔓 PAGO */}
            <ListCard title="Riscos jurídicos detalhados" items={riscos} />
            <Card
              title="Dívidas e responsabilidades"
              content={dividas_responsabilidades || "—"}
            />
            <Card
              title="Vale a pena ou não"
              content={parecer}
            />
          </div>
        )}

        {/* ⚠️ SEU BLOCO DE MENSALIDADE (pode manter, mas eu recomendo esconder enquanto NÃO pagou)
            Se você quiser manter visível, só tirar o if abaixo.
        */}
        {isPaid && (
          <div style={{ marginTop: 16, border: "1px solid #222", borderRadius: 14, padding: 14, background: "#111" }}>
            <b>Quer análises ilimitadas e acesso mensal?</b>
            <p style={{ margin: "8px 0 0 0", opacity: 0.85 }}>
              Destrave o plano mensal e use sem limite — ideal pra quem analisa vários editais por semana.
            </p>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/submission?plan=standard")}
                style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#22c55e", color: "#000", fontWeight: 900, cursor: "pointer" }}
              >
                Assinar Standard
              </button>
              <button
                onClick={() => navigate("/submission?plan=express")}
                style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #333", background: "transparent", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Assinar Express
              </button>
              <button
                onClick={() => navigate("/analisar")}
                style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #333", background: "transparent", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Analisar outro edital
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Paywall() {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const checkoutUrl = `${KIWIFY_CHECKOUT}?utm_source=preview&next=${encodeURIComponent(currentUrl)}`;

  return (
    <div style={{ marginTop: 16, border: "1px solid #222", borderRadius: 14, padding: 16, background: "#111" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0 }}>🔒 Conteúdo bloqueado</h3>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9, lineHeight: 1.5 }}>
            Desbloqueie por <b>R$19,90</b> para ver os pontos que mais geram prejuízo:
          </p>
        </div>

        <a
          href={checkoutUrl}
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "#22c55e",
            color: "#000",
            fontWeight: 900,
            textDecoration: "none"
          }}
        >
          🔒 Desbloquear por R$19,90
        </a>
      </div>

      <ul style={{ margin: "12px 0 0 0", paddingLeft: 18, lineHeight: 1.8, opacity: 0.95 }}>
        <li><b>Riscos jurídicos detalhados</b></li>
        <li><b>Dívidas e responsabilidades</b> do arrematante</li>
        <li><b>Conclusão final</b>: vale a pena ou não</li>
      </ul>

      <p style={{ margin: "10px 0 0 0", opacity: 0.75, fontSize: 13 }}>
        Após o pagamento, você retorna para esta página e o conteúdo é liberado automaticamente.
      </p>
    </div>
  );
}

function Card({ title, content }) {
  return (
    <div style={{ marginTop: 14, border: "1px solid #222", borderRadius: 14, padding: 14, background: "#111" }}>
      <h3 style={{ margin: "0 0 8px 0" }}>{title}</h3>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, opacity: 0.95 }}>
        {content || "—"}
      </div>
    </div>
  );
}

function ListCard({ title, items }) {
  const arr = Array.isArray(items) ? items : [];
  return (
    <div style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#111" }}>
      <h3 style={{ margin: "0 0 8px 0" }}>{title}</h3>
      {arr.length ? (
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          {arr.map((it, idx) => <li key={idx}>{it}</li>)}
        </ul>
      ) : (
        <div style={{ opacity: 0.8 }}>—</div>
      )}
    </div>
  );
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return null; }
}
