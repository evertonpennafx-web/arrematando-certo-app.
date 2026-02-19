export const pricingPlans = {
  free_tasting: {
    id: 'free_tasting',
    priceId: 'price_free_tasting_placeholder',
    name: 'Preview Gratuito',
    description: 'Recorte essencial do edital para uma leitura inicial.',
    price: '0',
    type: 'free',
    features: [
      'Identificação do leilão',
      'Datas principais',
      'Forma de pagamento',
      'Comissão do leiloeiro',
      'Exemplo de ponto de atenção',
      'Em 5 minutos'
    ]
  },

  // ✅ IA + HUMANO (mais valor, mais confiança)
  standard: {
    id: 'standard',
    priceId: 'price_standard_placeholder',
    name: 'Revisão Profissional',
    description: 'IA + revisão humana para uma decisão segura antes do lance.',
    price: '497,00',
    type: 'one-time',
    features: [
      'Análise completa do edital',
      'Revisão humana dos pontos críticos',
      'Identificação de riscos, ônus e custos',
      'Checklist completo antes do lance',
      'Relatório em linguagem clara (sem juridiquês)',
      'Atendimento via WhatsApp',
      'Edital + documentação do imóvel (se houver)',
      'PIX, cartão de crédito, transferência bancária',
      'Até 48 horas'
    ]
  },

  // ✅ RECORRÊNCIA (apenas IA / operação escalável)
  express: {
    id: 'express',
    priceId: 'price_express_monthly_placeholder',
    name: 'Plano Investidor (Express)',
    description: 'Para acompanhar oportunidades semanais com rapidez e previsibilidade.',
    price: '97,00',
    period: 'mês',
    type: 'subscription',
    billing: 'monthly',
    popular: true,
    features: [
      'Até 4 análises por mês (ideal: 1 por semana)',
      'Relatório express em linguagem clara',
      'Prioridade no atendimento',
      'Suporte via WhatsApp',
      'Envio de edital e documentos relacionados (se houver)',
      'Renovação mensal automática',
      'Prazo: Em 5 minutos'
    ]
  },

  express_annual: {
    id: 'express_annual',
    priceId: 'price_express_annual_placeholder',
    name: 'Plano Investidor (Anual)',
    description: 'Assinatura anual com 2 meses grátis.',
    price: '970,00',
    period: 'ano',
    type: 'subscription',
    billing: 'annual',
    popular: false,
    badge: '2 MESES GRÁTIS',
    savings: 'Economize 2 meses no plano anual',
    features: [
      'Até 4 análises por mês (48/ano)',
      'Relatório express em linguagem clara',
      'Prioridade no atendimento',
      'Suporte via WhatsApp',
      'Pagamento único anual',
      'Prazo: Em 5 minutos'
    ]
  },

  // ✅ HIGH TICKET (sem preço no site)
  premium: {
    id: 'premium',
    priceId: null, // Contact for price
    name: 'Consultoria Estratégica',
    description: 'Assessoria personalizada para arrematações complexas e estratégicas.',
    price: 'Valor sob consulta',
    type: 'consultation',
    features: [
      'Atendimento individualizado',
      'Análise aprofundada de documentação',
      'Estratégias de desocupação e regularização',
      'Orientação jurídica especializada',
      'Edital, contrato, documentação do imóvel, outros documentos',
      'PIX, cartão de crédito, transferência bancária',
      'Prazo a combinar'
    ]
  }
};

export const redirectToCheckout = async (priceId, successUrl, cancelUrl) => {
  try {
    console.log('Redirecting to checkout with priceId:', priceId);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (priceId) {
      const url = new URL(successUrl);
      window.location.href = url.toString();
    } else {
      throw new Error('Price ID missing');
    }

  } catch (error) {
    console.error('Redirect to checkout error:', error);
    throw error;
  }
};
