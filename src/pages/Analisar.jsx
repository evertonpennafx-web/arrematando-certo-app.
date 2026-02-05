async function handleAnalisar() {
  if (!texto.trim()) return;
  setLoading(true);

  try {
    const resp = await fetch("/api/analisar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    const json = await resp.json();

    if (!resp.ok) {
      alert(json?.error || "Erro ao analisar");
      return;
    }

    localStorage.setItem("ac_ultimo_resultado", JSON.stringify(json.data));
    navigate("/resultado");
  } catch (e) {
    alert("Erro de conexão");
  } finally {
    setLoading(false);
  }
}
