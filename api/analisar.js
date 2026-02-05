import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { texto } = req.body ?? {};

    if (!texto || typeof texto !== "string" || texto.trim().length < 200) {
      return res.status(400).json({ error: "Cole pelo menos ~200 caracteres do edital." });
    }

    const textoCortado = texto.slice(0, 12000);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const r = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Você é um analista de edital de leilão no Brasil. " +
            "Responda curto, direto e prático. " +
            "Retorne SOMENTE JSON válido com as chaves: " +
            "resumo (string), riscos (array de strings), checklist (array de strings), " +
            "perguntas (array de strings), proximo_passo (string), score_risco (número 0-10)."
        },
        {
          role: "user",
          content:
            "Analise o edital abaixo e retorne SOMENTE o JSON pedido.\n\nEDITAL:\n" + textoCortado
        }
      ]
    });

    const output = (r.output_text || "").trim();

    let data;
    try {
      data = JSON.parse(output);
    } catch {
      return res.status(502).json({
        error: "O modelo não retornou JSON válido",
        raw: output.slice(0, 2000)
      });
    }

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: "Erro no servidor", details: String(e?.message || e) });
  }
}
