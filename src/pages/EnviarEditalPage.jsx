import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import GradientBackground from '@/components/ui/GradientBackground';
import { pricingPlans } from '@/lib/stripe';

const EnviarEditalPage = () => {
  const navigate = useNavigate();

  const handlePlanSelect = (planId) => {
    if (planId === 'free_tasting') {
      navigate('/degustacao-gratuita');
      return;
    }
    if (planId === 'premium') {
      navigate('/consultoria');
      return;
    }
    navigate(`/submission?plan=${planId}`);
  };

  // Helper to filter out duplicates or specific annual variants if needed. 
  // For now, displaying all as requested, but grouping logic could be applied.
  const displayPlans = Object.values(pricingPlans).filter(p => p.billing !== 'annual');

  return (
    <Layout>
      <Helmet>
        <title>Escolha seu Plano - Arrematando Certo</title>
        <meta name="description" content="Escolha o plano ideal para a análise do seu edital de leilão." />
      </Helmet>

      <div className="relative min-h-screen pt-24 pb-16">
        <GradientBackground variant="default" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Escolha seu{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                Plano
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Selecione a opção que melhor atende suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border flex flex-col ${
                  plan.popular ? 'border-[#d4af37] shadow-lg shadow-[#d4af37]/10' : 'border-gray-800'
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 min-h-[40px]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.type === 'consultation' ? (
                    <span className="text-2xl font-bold text-[#d4af37]">Sob consulta</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#d4af37]">R$ {plan.price}</span>
                      {plan.period && <span className="text-sm text-gray-500">/{plan.period}</span>}
                    </div>
                  )}
                  {plan.type === 'one-time' && <span className="text-xs text-gray-500 block mt-1">Pagamento único</span>}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black hover:shadow-lg hover:shadow-[#d4af37]/20'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {plan.type === 'consultation' ? 'Solicitar' : 'Escolher Plano'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnviarEditalPage;