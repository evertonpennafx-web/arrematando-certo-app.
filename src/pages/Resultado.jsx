import { Link, useNavigate } from "react-router-dom";

export default function Resultado() {
  const navigate = useNavigate();

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
            style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#22c55e", color: "#000", fontWeight: 900 }}
          >
            Ir para análise
          </button>
        </div>
      </div>
    );
  }

  const { resumo, riscos, checklist, perguntas, proximo_passo, score_risco } = data;

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

        <Card title="Resumo" content={resumo} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 14 }}>
          <ListCard title="Riscos / Atenção" items={riscos} />
          <ListCard title="Checklist de documentos" items={checklist} />
          <ListCard title="Perguntas que você deve fazer" items={perguntas} />
        </div>

        <Card title="Próximo passo recomendado" content={proximo_passo} />

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
      </div>
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
