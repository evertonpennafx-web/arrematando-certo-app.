import { Link } from "react-router-dom";

export default function Resultado() {
  const raw = localStorage.getItem("ac_ultimo_resultado");
  const data = raw ? JSON.parse(raw) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Resultado</h1>

      {!data ? (
        <div style={{ marginTop: 16, opacity: 0.85 }}>
          Nenhum resultado encontrado. <Link to="/analisar" style={{ color: "#22c55e" }}>Voltar para Analisar</Link>
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 900 }}>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 14 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Resumo</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>{data.resumo}</p>
          </div>

          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 14 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Riscos / Atenções</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, opacity: 0.9 }}>
              {data.riscos?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 14 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Checklist</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, opacity: 0.9 }}>
              {data.checklist?.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/analisar" style={{ padding: "10px 14px", border: "1px solid #333", borderRadius: 10, color: "#fff", textDecoration: "none" }}>
              Nova análise
            </Link>
            <Link to="/" style={{ padding: "10px 14px", border: "1px solid #333", borderRadius: 10, color: "#fff", textDecoration: "none" }}>
              Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
