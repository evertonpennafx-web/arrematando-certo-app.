import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Analisar() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleAnalisar() {
    if (!texto.trim()) return;
    setLoading(true);

    try {
      const resp = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });

      const json = await resp.json();

      if (!resp.ok) {
        alert(json?.error || "Erro ao analisar");
        return;
      }

      // na API eu retorno { ok: true, data: {...} }
      localStorage.setItem("ac_ultimo_resultado", JSON.stringify(json.data));
      navigate("/resultado");
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Analisar edital</h1>
      <p style={{ opacity: 0.85, maxWidth: 900 }}>
        Cole o texto do edital abaixo. (Por enquanto sem PDF, pra validar operação com custo baixo.)
      </p>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cole o edital aqui…"
        style={{
          width: "100%",
          minHeight: 280,
          background: "#111",
          color: "#fff",
          border: "1px solid #222",
          borderRadius: 12,
          padding: 12,
          outline: "none",
        }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={handleAnalisar}
          disabled={loading || !texto.trim()}
          style={{
            padding: "10px 14px",
            background: loading ? "#14532d" : "#22c55e",
            color: "#000",
            border: "none",
            borderRadius: 10,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analisando..." : "Gerar relatório"}
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 14px",
            background: "transparent",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
