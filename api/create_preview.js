function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function normUrl(u) {
  return String(u || "").trim().replace(/\/+$/, "");
}

async function callFn({ supabaseUrl, serviceRole, fnName, body }) {
  const functionUrl = `${supabaseUrl}/functions/v1/${fnName}`;

  const fnResp = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRole,
      authorization: `Bearer ${serviceRole}`,
    },
    body: JSON.stringify(body),
  });

  const txt = await fnResp.text().catch(() => "");
  let data = null;
  try {
    data = txt ? JSON.parse(txt) : null;
  } catch {
    data = null;
  }

  return { ok: fnResp.ok && data?.ok, status: fnResp.status, functionUrl, data, raw: txt };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const SUPABASE_URL = normUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
    const SERVICE_ROLE = String(
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "",
    ).trim();

    if (!SUPABASE_URL) {
      return sendJson(res, 500, { ok: false, error: "Missing env: SUPABASE_URL (or VITE_SUPABASE_URL)" });
    }
    if (!SERVICE_ROLE) {
      return sendJson(res, 500, { ok: false, error: "Missing env: SUPABASE_SERVICE_ROLE_KEY" });
    }

    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
      }
    }

    const url_pdf = String(body?.url_pdf || body?.pdf_url || "").trim();
    const edital_link = String(body?.edital_link || body?.leilao_url || "").trim();
    const nome = String(body?.nome || "").trim();
    const whatsapp = String(body?.whatsapp || "").trim();
    const email = String(body?.email || "").trim();

    if (!url_pdf) return sendJson(res, 400, { ok: false, error: "Missing url_pdf/pdf_url" });
    if (!edital_link) return sendJson(res, 400, { ok: false, error: "Missing edital_link/leilao_url" });
    if (!nome) return sendJson(res, 400, { ok: false, error: "Missing nome" });
    if (!whatsapp) return sendJson(res, 400, { ok: false, error: "Missing whatsapp" });
    if (!email) return sendJson(res, 400, { ok: false, error: "Missing email" });

    if (!url_pdf.toLowerCase().includes(".pdf")) {
      return sendJson(res, 400, {
        ok: false,
        error: "O link do PDF parece inválido. Copie o link direto do PDF (normalmente contém .pdf).",
      });
    }

    const payload = {
      url_pdf,
      edital_link,
      pdf_url: url_pdf,
      leilao_url: edital_link,
      nome,
      whatsapp,
      email,
    };

    // ✅ tenta nomes comuns
    const fnCandidates = ["create_preview", "createPreview", "create-preview"];

    const attempts = [];
    for (const fnName of fnCandidates) {
      const r = await callFn({
        supabaseUrl: SUPABASE_URL,
        serviceRole: SERVICE_ROLE,
        fnName,
        body: payload,
      });

      attempts.push({ fnName, status: r.status, functionUrl: r.functionUrl, data: r.data || null });

      if (r.ok) {
        return sendJson(res, 200, r.data);
      }

      // Se foi NOT_FOUND 404, continua tentando
      if (r.status !== 404) {
        // qualquer outro erro, já devolve
        return sendJson(res, 500, {
          ok: false,
          error: r.data?.error || "Falha ao criar prévia.",
          details: r.data?.details || r.data || r.raw || null,
          debug: { attempts },
        });
      }
    }

    // nenhuma function existe
    return sendJson(res, 500, {
      ok: false,
      error: "Nenhuma Edge Function encontrada no Supabase com nomes testados.",
      details: "Crie/deploy a function com o nome correto (ex: create_preview) no projeto Supabase configurado.",
      debug: { attempts, usedSupabaseUrl: SUPABASE_URL },
    });
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: "Unhandled error", details: String(err?.message || err) });
  }
}
