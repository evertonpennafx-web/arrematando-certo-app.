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
      'Exemplo de risco identificado',
      'Até 24 horas'
    ]
  },
  standard: {
    id: 'standard',
    priceId: 'price_standard_placeholder',
    name: 'Revisão Profissional',
    description: 'Análise completa de um edital com relatório detalhado.',
    price: '497,00',
    type: 'one-time',
    features: [
      'Análise completa do edital',
      'Identificação de riscos e oportunidades',
      'Sugestões para o lance',
      'Relatório completo em linguagem clara',
      'Atendimento via WhatsApp',
      'Edital, contrato, documentação do imóvel, outros documentos',
      'PIX, cartão de crédito, transferência bancária',
      'Até 48 horas'
    ]
  },
  express: {
    id: 'express',
    priceId: 'price_express_monthly_placeholder',
    name: 'Resumo Express',
    description: 'Assinatura para análise rápida e recorrente de editais.',
    price: '297,00',
    period: 'mês',
    type: 'subscription',
    billing: 'monthly',
    popular: true,
    features: [
      'Análises ilimitadas por mês (limite justo)',
      'Prioridade na fila de análise',
      'Relatório express em linguagem clara',
      'Suporte prioritário via WhatsApp',
      'Edital, contrato, documentação do imóvel, outros documentos',
      'PIX, cartão de crédito, transferência bancária',
      'Até 24 horas'
    ]
  },
  express_annual: {
    id: 'express_annual',
    priceId: 'price_express_annual_placeholder',
    name: 'Resumo Express Anual',
    description: 'Assinatura anual com 2 meses grátis.',
    price: '2.970,00',
    period: 'ano',
    type: 'subscription',
    billing: 'annual',
    popular: true,
    badge: '2 MESES GRÁTIS',
    savings: 'Economize R$ 594,00 (2 meses OFF)',
    features: [
      'Tudo do plano mensal',
      '2 meses de assinatura grátis',
      'Prioridade máxima na fila',
      'Relatório express em linguagem clara',
      'Suporte prioritário via WhatsApp',
      'Análises ilimitadas (fair usage)',
      'Pagamento único anual',
      'Até 24 horas'
    ]
  },
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
    // This is a simulation since we don't have a real backend in this environment
    // In a real app, this would fetch from an API endpoint that creates a Stripe session
    console.log('Redirecting to checkout with priceId:', priceId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demonstration purposes, we'll just redirect to the success URL
    // since we can't actually go to Stripe without a real backend/API key
    if (priceId) {
      // In production, this would be: window.location.href = session.url;
      // Here we simulate a successful redirect flow for the frontend demo
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