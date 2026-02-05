import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Arrematando Certo</h1>
      <p style={{ opacity: 0.85, maxWidth: 700 }}>
        Cole o texto do edital ou envie um PDF e receba: resumo, pontos de atenção, riscos e checklist de documentos.
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/analisar" style={{ padding: "10px 14px", background: "#22c55e", color: "#000", textDecoration: "none", borderRadius: 10, fontWeight: 700 }}>
          Analisar edital
        </Link>
        <a href="#como-funciona" style={{ padding: "10px 14px", border: "1px solid #333", color: "#fff", textDecoration: "none", borderRadius: 10 }}>
          Como funciona
        </a>
      </div>

      <div id="como-funciona" style={{ marginTop: 36, borderTop: "1px solid #222", paddingTop: 16, opacity: 0.9 }}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 18 }}>Como funciona</h2>
        <ol style={{ lineHeight: 1.6 }}>
          <li>Você cola o edital (ou envia PDF).</li>
          <li>O sistema extrai regras, prazos, taxas e exigências.</li>
          <li>Você recebe um relatório direto ao ponto.</li>
        </ol>
      </div>
    </div>
  );
}
