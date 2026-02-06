import { createClient } from "@supabase/supabase-js";

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

const nowIso = () => new Date().toISOString();

function buildMockReportHtml({ nome = "Cliente", pdfUrl = "" }) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 8px;">
    <h1 style="margin:0 0 8px 0;">Relatório de Análise (Preview)</h1>
    <p style="margin:0 0 16px 0; color:#444;">
      Olá <b>${nome}</b>. Seu documento foi recebido e processado.
    </p>

    <h2 style="margin:16px 0 8px 0;">Resumo</h2>
    <ul>
      <li><b>Status:</b> OK (pipeline validado)</li>
      <li><b>Modelo:</b> Mock (próximo passo: IA real)</li>
      <li><b>Ação:</b> Você pode avançar para versão paga com análise completa</li>
    </ul>

    <h2 style="margin:16px 0 8px 0;">Arquivo</h2>
    <p><a href="${pdfUrl}" target="_blank" rel="noreferrer">Abrir PDF enviado</a></p>

    <hr style="margin:24px 0;" />
    <p style="font-size:12px; color:#777;">Gerado em ${new Date().toLocaleString("pt-BR")}</p>
  </div>
  `;
}

export default async function handler(req, res) {
  // 🔥 Log básico por request
  console.log("[/api/analisar] start", req.method);

  try {
    if (req.method !== "POST") {
      return send(res, 405, { error: "Method not allowed" });
    }

    const { id } = req.body || {};
    if (!id) return send(res, 400, { error: "Missing 'id' in body" });

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error("ENV missing: SUPABASE_URL");
      return send(res, 500, { error: "Server misconfigured: SUPABASE_URL missing" });
    }
    if (!serviceRoleKey) {
      console.error("ENV missing: SUPABASE_SERVICE_ROLE_KEY");
      return send(res, 500, { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY missing" });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1) Busca registro
    const { data: row, error: fetchErr } = await supabase
      .from("preview_gratuito")
      .select("id, nome, url_pdf, edital_link, status")
      .eq("id", id)
      .single();

    if (fetchErr || !row) {
      console.error("Fetch error:", fetchErr);
      return send(res, 404, { error: "Registro não encontrado", details: fetchErr?.message });
    }

    console.log("[/api/analisar] found row", { id: row.id, status: row.status });

    // Se já está done, não reprocessa
    if (row.status === "done") {
      console.log("[/api/analisar] already done");
      return send(res, 200, { ok: true, id, status: "done" });
    }

    // 2) Marca como processing
    await supabase
      .from("preview_gratuito")
      .update({ status: "processing", updated_at: nowIso(), error_message: null })
      .eq("id", id);

    const pdfUrl = row.url_pdf || "";
    const editalLink = row.edital_link || "";

    if (!pdfUrl && !editalLink) {
      await supabase
        .from("preview_gratuito")
        .update({
          status: "error",
          error_message: "Nenhum PDF (url_pdf) ou link (edital_link) informado.",
          updated_at: nowIso(),
        })
        .eq("id", id);

      return send(res, 400, { error: "Registro sem PDF/link" });
    }

    // 3) (Mock) gera relatório
    const reportHtml = buildMockReportHtml({ nome: row.nome, pdfUrl });
    const resultJson = {
      mode: "mock",
      source: pdfUrl ? "pdf" : "link",
      pdfUrl,
      editalLink,
      generated_at: nowIso(),
    };

    // 4) Salva done
    const { error: updErr } = await supabase
      .from("preview_gratuito")
      .update({
        status: "done",
        report_html: reportHtml,
        result_json: resultJson,
        analyzed_at: nowIso(),
        updated_at: nowIso(),
        error_message: null,
      })
      .eq("id", id);

    if (updErr) {
      console.error("Update error:", updErr);
      await supabase
        .from("preview_gratuito")
        .update({
          status: "error",
          error_message: `Falha ao salvar relatório: ${updErr.message}`,
          updated_at: nowIso(),
        })
        .eq("id", id);

      return send(res, 500, { error: "Falha ao salvar relatório", details: updErr.message });
    }

    console.log("[/api/analisar] done", id);
    return send(res, 200, { ok: true, id, status: "done" });
  } catch (err) {
    console.error("[/api/analisar] unhandled", err);
    return send(res, 500, { error: "Erro interno", details: String(err?.message || err) });
  }
}
