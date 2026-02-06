import { createClient } from "@supabase/supabase-js";

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  // CORS básico
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let safeId = null;

  try {
    // ✅ Backend envs (corretas)
    // (fallback pro VITE_ só pra não travar se você setou errado)
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

    if (!SUPABASE_URL) {
      return sendJson(res, 500, {
        error: "Missing env: SUPABASE_URL",
        hint: "Crie SUPABASE_URL na Vercel e faça um novo deploy (redeploy do mais recente).",
      });
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return sendJson(res, 500, {
        error: "Missing env: SUPABASE_SERVICE_ROLE_KEY",
        hint: "Crie SUPABASE_SERVICE_ROLE_KEY na Vercel (sem VITE_) e faça um novo deploy.",
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // parse body
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return sendJson(res, 400, { error: "Invalid JSON body" });
      }
    }

    const { id } = body || {};
    if (!id) return sendJson(res, 400, { error: "Missing required field: id" });
    safeId = id;

    // 1) busca registro
    const { data: row, error: fetchErr } = await supabase
      .from("preview_gratuito")
      .select("id, status, edital_link, url_pdf, access_token")
      .eq("id", id)
      .single();

    if (fetchErr || !row) {
      return sendJson(res, 404, {
        error: "Registro não encontrado",
        details: fetchErr?.message || null,
      });
    }

    // 2) marca como processing
    await supabase
      .from("preview_gratuito")
      .update({ status: "processing", error_message: null })
      .eq("id", id);

    // 3) GERA RELATÓRIO (mock)
    const fonte = row.edital_link || row.url_pdf || "(sem fonte)";
    const now = new Date().toISOString();

    const result_json = {
      ok: true,
      fonte,
      gerado_em: now,
      resumo: {
        pontos_de_atencao: [
          "Verifique prazos e datas do edital.",
          "Confirme condições de pagamento e comissão do leiloeiro.",
          "Cheque débitos/ônus e possibilidade de desocupação.",
        ],
        recomendacao:
          "Análise preliminar automática. Recomenda-se revisão completa antes de arrematar.",
      },
    };

    const report_html = `
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Relatório - Arrematando Certo</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; background:#0b0b0b; color:#fff; margin:0; padding:24px;}
    .card{max-width:920px; margin:0 auto; background:#111; border:1px solid #222; border-radius:16px; padding:20px;}
    h1{margin:0 0 6px 0; font-size:24px;}
    .muted{color:#aaa; margin:0 0 16px 0;}
    .box{background:#0f0f0f; border:1px solid #222; border-radius:14px; padding:14px; margin-top:14px;}
    ul{margin:8px 0 0 18px;}
    a{color:#d4af37;}
    .badge{display:inline-block; padding:6px 10px; border-radius:999px; background:#1a1a1a; border:1px solid #2a2a2a; color:#d4af37; font-weight:700; font-size:12px;}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">PRÉVIA AUTOMÁTICA</div>
    <h1>Relatório de Análise</h1>
    <p class="muted">Gerado em ${now}</p>

    <div class="box">
      <b>Fonte:</b>
      <div style="margin-top:6px;">${fonte}</div>
    </div>

    <div class="box">
      <b>Pontos de atenção</b>
      <ul>
        <li>Verifique prazos e datas do edital</li>
        <li>Condições de pagamento e comissão do leiloeiro</li>
        <li>Débitos/ônus e desocupação</li>
      </ul>
    </div>

    <div class="box">
      <b>Recomendação</b>
      <div style="margin-top:8px;">Análise preliminar automática. Recomenda-se revisão completa antes de arrematar.</div>
    </div>
  </div>
</body>
</html>`.trim();

    // 4) atualiza como done
    const { error: updErr } = await supabase
      .from("preview_gratuito")
      .update({
        status: "done",
        result_json,
        report_html,
        analyzed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", id);

    if (updErr) {
      // marca como error antes de responder (pra não deixar processando infinito)
      await supabase
        .from("preview_gratuito")
        .update({
          status: "error",
          error_message: String(updErr.message || "Falha ao atualizar registro").slice(0, 900),
          analyzed_at: new Date().toISOString(),
        })
        .eq("id", id);

      return sendJson(res, 200, {
        ok: false,
        error: "Falha ao finalizar a análise. Tente novamente.",
        details: updErr.message,
      });
    }

    return sendJson(res, 200, { ok: true, id });
  } catch (err) {
    const message = String(err?.message || err || "unknown error");

    // tenta marcar no banco (sem quebrar retorno mesmo se falhar)
    try {
      const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
      const SUPABASE_SERVICE_ROLE_KEY =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && safeId) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false },
        });

        await supabase
          .from("preview_gratuito")
          .update({
            status: "error",
            error_message: message.slice(0, 900),
            analyzed_at: new Date().toISOString(),
          })
          .eq("id", safeId);
      }
    } catch (_) {}

    return sendJson(res, 200, {
      ok: false,
      error: "Falha ao analisar. Tente novamente.",
      details: message,
    });
  }
}
