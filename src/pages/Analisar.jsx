import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function Analisar() {
  const [msg, setMsg] = useState("Iniciando análise…");

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const id = qs.get("id") || "";
    const t = qs.get("t") || qs.get("token") || "";

    if (!id) {
      setMsg("Link inválido: id ausente.");
      return;
    }

    (async () => {
      try {
        setMsg("Disparando análise…");

        const resp = await fetch("/api/analisar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const payload = await resp.json().catch(() => ({}));

        // Se já tem token, manda pro relatório direto
        if (t) {
          window.location.replace(`/relatorio?id=${encodeURIComponent(id)}&t=${encodeURIComponent(t)}`);
          return;
        }

        // Se não tem token, tenta só abrir o relatório (pode falhar se seu relatório exigir token)
        window.location.replace(`/relatorio?id=${encodeURIComponent(id)}`);
      } catch (e) {
        setMsg("Falha ao iniciar análise. Tente novamente.");
      }
    })();
  }, []);

  return (
    <Layout>
      <div style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 720, width: "100%", background: "#111", border: "1px solid #222", borderRadius: 16, padding: 18, color: "#fff" }}>
          <b>{msg}</b>
          <div style={{ marginTop: 8, color: "#aaa" }}>
            Se isso demorar, volte e tente novamente.
          </div>
        </div>
      </div>
    </Layout>
  );
}
