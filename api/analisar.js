import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.body

  if (!id) {
    return res.status(400).json({ error: 'ID obrigatório' })
  }

  try {
    // 1️⃣ Buscar registro
    const { data: preview, error } = await supabase
      .from('preview_gratuito')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !preview) {
      return res.status(404).json({ error: 'Preview não encontrado' })
    }

    if (preview.status === 'done') {
      return res.status(200).json({ message: 'Já processado' })
    }

    // 2️⃣ Atualiza status
    await supabase
      .from('preview_gratuito')
      .update({ status: 'processing' })
      .eq('id', id)

    // 3️⃣ MOCK DE ANÁLISE (substituível por OpenAI)
    const resultJson = {
      fonte: preview.edital_link || preview.url_pdf,
      riscos: [
        'Prazo curto para entrega',
        'Multas contratuais elevadas',
        'Exigências técnicas específicas'
      ],
      oportunidades: [
        'Baixa concorrência prevista',
        'Contrato recorrente',
        'Compatível com empresas médias'
      ],
      score_viabilidade: 8.1
    }

    const reportHtml = `
      <div style="font-family: Arial; line-height:1.6">
        <h1>Relatório de Viabilidade do Edital</h1>

        <h2>⚠️ Riscos</h2>
        <ul>${resultJson.riscos.map(r => `<li>${r}</li>`).join('')}</ul>

        <h2>🚀 Oportunidades</h2>
        <ul>${resultJson.oportunidades.map(o => `<li>${o}</li>`).join('')}</ul>

        <h2>📊 Score Final</h2>
        <strong>${resultJson.score_viabilidade}/10</strong>

        <hr />
        <small>Gerado automaticamente pelo Arrematando Certo</small>
      </div>
    `

    // 4️⃣ Finaliza
    await supabase
      .from('preview_gratuito')
      .update({
        status: 'done',
        report_html: reportHtml,
        result_json: resultJson,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', id)

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)

    await supabase
      .from('preview_gratuito')
      .update({
        status: 'error',
        error_message: err.message
      })
      .eq('id', id)

    return res.status(500).json({ error: 'Erro no processamento' })
  }
}
