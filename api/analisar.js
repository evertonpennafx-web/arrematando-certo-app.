import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { texto } = req.body || {};

    if (!texto || texto.length < 200) {
      return res.status(400).json({
        error: "Cole pelo menos 200 caracteres do edital.",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Você é um analista de edital de leilão no Brasil. " +
            "Responda apenas em JSON com: resumo, riscos[], checklist[], proximo_passo, score_risco.",
        },
        {
          role: "user",
          content: texto.slice(0, 12000),
        },
      ],
    });

    const output = response.output_text;
    const data = JSON.parse(output);

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({
      error: "Erro ao analisar edital",
      details: err.message,
    });
  }
}
