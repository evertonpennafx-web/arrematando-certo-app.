import { createClient } from "@supabase/supabase-js";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function nowIso() {
  return new Date().toISOString();
}

function buildMockReportHtml({ nome = "Cliente", pdfUrl = "" }) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h1 style="margin: 0 0 8px 0;">Relatório de Análise (Preview)</h1>
    <p style="margin: 0 0 16px 0; color: #444;">
      Olá <b>${nome}</b>, aqui vai um preview gerado automaticamente.
    </p>

    <h2>Pontos principais</h2>
    <ul>
      <li><b>Status do edital:</b> Documento recebido e processado.</li>
      <li><b>Observação:</b> Esta versão é um mock para validar o pipeline end-to-end.</li>
      <li><b>Próximo passo:</b> Substituir o mock por leitura real do PDF + IA.</li>
    </ul>

    <h2>Arquivo enviado</h2>
    <p>
      <a href="${pdfUrl}" target="_blank" rel="noreferrer">Abrir PDF</a>
    </p>

    <hr style="margin: 24px 0;" />
    <p style="color:#777; font-size: 12px;">
      Gerado em ${new Date().toLocaleString("pt-BR")}
    </p>
  </div>
  `;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }

    const { id } = req.body || {};
    if (!id) return json(res, 400, { error: "Missing 'id' in body" });

    // ✅ ENV VARS (CORRETAS)
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 🔥 ERRO CLARO se estiver faltando
    if (!supabaseUrl) {
      console.error("ENV missing: SUPABASE_URL");
      return json(res, 500, { error: "Server misconfigured: SUPABASE_URL missing" });
    }
    if (!serviceRoleKey) {
      console.error("ENV missing: SUPABASE_SERVICE_ROLE_KEY");
      return json(res, 500, { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY missing" });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1) Busca registro
    const { data: row, error: fetchErr } = await supabase
      .from("preview_gratuito")
      .select("id, nome, email, whatsapp, url_pdf, edital_link, status")
      .eq("id", id)
      .single();

    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return json(res, 404, { error: "Registro não encontrado", details: fetchErr.message });
    }

    // 2) Marca como processing
    await supabase
      .from("preview_gratuito")
      .update({ status: "processing", updated_at: nowIso() })
      .eq("id", id);

    // 3) Pega fonte (PDF ou link)
    const pdfUrl = row.url_pdf || "";
    const editalLink = row.edital_link || "";

    if (!pdfUrl && !editalLink) {
      await supabase
        .from("preview_gratuito")
        .update({
          status: "error",
          error_message: "Nenhum PDF ou link de edital encontrado",
          updated_at: nowIso(),
        })
        .eq("id", id);

      return json(res, 400, { error: "Nenhum PDF ou link foi encontrado no registro" });
    }

    // 4) (Mock) Gera relatório
    const reportHtml = buildMockReportHtml({ nome: row.nome, pdfUrl });
    const resultJson = {
      mode: "mock",
      source: pdfUrl ? "pdf" : "link",
      pdfUrl,
      editalLink,
      generated_at: nowIso(),
      summary: {
        riscos: ["Mock: validar pipeline"],
        pontos_atencao: ["Mock: substituir por IA"],
        recomendacao: "Mock: relatório gerado com sucesso.",
      },
    };

    // 5) Atualiza como done
    const { error: updateErr } = await supabase
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

    if (updateErr) {
      console.error("Update error:", updateErr);
      return json(res, 500, { error: "Falha ao salvar relatório", details: updateErr.message });
    }

    return json(res, 200, { ok: true, id });
  } catch (err) {
    console.error("Unhandled error:", err);

    // tenta marcar no banco como error se possível (sem quebrar)
    try {
      const { id } = req.body || {};
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (id && supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });
        await supabase
          .from("preview_gratuito")
          .update({
            status: "error",
            error_message: String(err?.message || err),
            updated_at: nowIso(),
          })
          .eq("id", id);
      }
    } catch (e) {
      console.error("Failed to mark error in DB:", e);
    }

    return json(res, 500, { error: "Erro interno", details: String(err?.message || err) });
  }
}
