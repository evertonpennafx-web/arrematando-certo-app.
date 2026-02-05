import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FREE_LIMIT_PER_DAY = 1;
const LS_KEY_DAY = "ac_free_day";
const LS_KEY_COUNT = "ac_free_count";

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Analisar() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { remaining, blocked } = useMemo(() => {
    const day = todayKey();
    const savedDay = localStorage.getItem(LS_KEY_DAY);
    let count = Number(localStorage.getItem(LS_KEY_COUNT) || "0");

    if (savedDay !== day) {
      localStorage.setItem(LS_KEY_DAY, day);
      localStorage.setItem(LS_KEY_COUNT, "0");
      count = 0;
    }

    const rem = Math.max(0, FREE_LIMIT_PER_DAY - count);
    return { remaining: rem, blocked: rem <= 0 };
  }, []);

  async function handleAnalisar() {
    if (!texto.trim()) return;

    // bloqueio grátis
    if (blocked) {
      alert("Você já usou sua análise grátis de hoje. Assine para análises ilimitadas.");
      navigate("/submission?plan=standard");
      return;
    }

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

      // salva resultado
      localStorage.setItem("ac_ultimo_resultado", JSON.stringify(json.data));

      // incrementa uso diário
      const count = Number(localStorage.getItem(LS_KEY_COUNT) || "0");
      localStorage.setItem(LS_KEY_COUNT, String(count + 1));

      navigate("/resultado");
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link to="/" style={{ color: "#bbb", textDecoration: "none" }}>← Voltar</Link>

        <h1 style={{ margin: "12px 0 6px 0", fontSize: 22 }}>Analisar edital</h1>
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          Grátis: <b>{remaining}</b> análise(s) restante(s) hoje.
          {" "}
          {blocked ? (
            <span style={{ color: "#f87171" }}>Limite atingido.</span>
          ) : (
            <span style={{ color: "#86efac" }}>Disponível.</span>
          )}
        </p>

        {blocked && (
          <div style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#111", marginTop: 12 }}>
            <b>Você já usou sua análise grátis hoje.</b>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/submission?plan=standard")}
                style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#22c55e", color: "#000", fontWeight: 900, cursor: "pointer" }}
              >
                Destravar ilimitado (mensal)
              </button>
              <button
                onClick={() => navigate("/submission?plan=express")}
                style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #333", background: "transparent", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Quero Express
              </button>
            </div>
          </div>
        )}

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Cole o texto do edital aqui…"
          style={{
            width: "100%",
            minHeight: 300,
            background: "#111",
            color: "#fff",
            border: "1px solid #222",
            borderRadius: 12,
            padding: 12,
            outline: "none",
            marginTop: 14,
          }}
        />

        <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={handleAnalisar}
            disabled={loading || !texto.trim()}
            style={{
              padding: "12px 14px",
              background: loading ? "#14532d" : "#22c55e",
              color: "#000",
              border: "none",
              borderRadius: 10,
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analisando..." : "Gerar relatório"}
          </button>

          <button
            onClick={() => navigate("/submission?plan=standard")}
            style={{
              padding: "12px 14px",
              background: "transparent",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Ver planos (mensal)
          </button>
        </div>
      </div>
    </div>
  );
}
