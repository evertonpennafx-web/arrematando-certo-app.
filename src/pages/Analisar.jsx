import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Analisar() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleAnalisar() {
    if (!texto.trim()) return;
    setLoading(true);

    // MVP: mock rápido (depois troca por chamada real)
    const resultado = {
      resumo: "Resumo automático do edital (mock).",
      riscos: [
        "Verificar prazo de pagamento e multa.",
        "Checar se há comissão do leiloeiro e taxas extras.",
      ],
      checklist: ["Documentos pessoais", "Comprovante de endereço", "Cadastro no leiloeiro"],
      fonte: "Texto colado",
      criadoEm: new Date().toISOString(),
    };

    localStorage.setItem("ac_ultimo_resultado", JSON.stringify(resultado));
    setLoading(false);
    navigate("/resultado");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Analisar edital</h1>
      <p style={{ opacity: 0.85, maxWidth: 800 }}>
        Cole aqui o texto do edital. (Upload de PDF entra no próximo passo.)
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

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
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
      </div>
    </div>
  );
}
