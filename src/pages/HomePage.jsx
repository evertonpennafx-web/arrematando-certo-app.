import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  AlertCircle, 
  Shield, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Target,
  Users,
  Zap,
  Award,
  ArrowRight,
  Star,
  Home,
  Building2,
  Map,
  Briefcase,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import Layout from '@/components/Layout';
import GradientBackground from '@/components/ui/GradientBackground';
import { pricingPlans } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

const HomePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [expressBilling, setExpressBilling] = useState('monthly'); // 'monthly' | 'annual'

  const handlePlanSelect = (planId) => {
    // Handling Free Tasting Button Click
    if (planId === 'free_tasting') {
      navigate('/degustacao-gratuita');
      return;
    }
    
    // Handling Consultation Button Click
    if (planId === 'premium') { 
       navigate('/consultoria');
       return;
    }

    // Redirect to submission form with selected plan
    const url = `/submission?plan=${planId}`;
    navigate(url);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <Layout>
      <Helmet>
        <title>Arrematando Certo - Análise Profissional de Editais de Leilão</title>
        <meta name="description" content="Transformamos editais de leilão em um resumo claro, objetivo e sem juridiquês. Descubra os ônus, riscos, custos e oportunidades do imóvel antes de dar seu lance." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1541806631522-7a6c17387462"
            alt="Real estate auction"
            className="w-full h-full object-cover"
          />
          <GradientBackground variant="hero" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transformamos editais de leilão em um{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                resumo claro, objetivo e sem juridiquês
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto"
          >
            Descubra os ônus, riscos, custos e oportunidades do imóvel antes de dar seu lance
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/enviar-edital"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-lg font-bold rounded-lg hover:shadow-2xl hover:shadow-[#d4af37]/50 transition-all duration-300 hover:scale-105"
            >
              Enviar Edital Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-[#d4af37] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#d4af37] rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="relative py-24 overflow-hidden">
        <GradientBackground variant="section" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Por que você precisa de análise profissional?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Editais de leilão escondem armadilhas que podem transformar uma oportunidade em prejuízo
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: FileText,
                title: 'Editais com centenas de páginas',
                description: 'Documentos extensos e complexos que consomem horas de leitura'
              },
              {
                icon: AlertCircle,
                title: 'Linguagem jurídica confusa',
                description: 'Termos técnicos e juridiquês impossibilitam compreensão clara'
              },
              {
                icon: Shield,
                title: 'Custos escondidos',
                description: 'Débitos, ônus e encargos ocultos que explodem o investimento'
              },
              {
                icon: Users,
                title: 'Risco de imóvel ocupado',
                description: 'Situações de ocupação que podem travar seu investimento por anos'
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-[#d4af37]/50 transition-all duration-300">
                  <problem.icon className="w-12 h-12 text-[#d4af37] mb-4" />
                  <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
                  <p className="text-gray-400">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              O que o{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                Arrematando Certo
              </span>
              {' '}entrega
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                icon: CheckCircle,
                title: 'Resumo objetivo e direto',
                description: 'Tudo que importa em linguagem simples e clara, sem juridiquês'
              },
              {
                icon: AlertCircle,
                title: 'Identificação de riscos',
                description: 'Todos os ônus, débitos e situações que podem comprometer seu investimento'
              },
              {
                icon: TrendingUp,
                title: 'Pontos favoráveis destacados',
                description: 'Oportunidades e vantagens do imóvel para maximizar seu retorno'
              },
              {
                icon: Target,
                title: 'Checklist completo',
                description: 'Lista organizada de tudo que você precisa saber antes de dar o lance'
              }
            ].map((solution, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex gap-4 p-6 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-[#d4af37]/30 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
                    <solution.icon className="w-6 h-6 text-black" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{solution.title}</h3>
                  <p className="text-gray-400">{solution.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 overflow-hidden">
        <GradientBackground variant="section" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Como funciona
            </h2>
            <p className="text-xl text-gray-400">
              Processo simples e rápido em 3 passos
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#d4af37] via-[#b8941f] to-transparent hidden md:block" />

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="space-y-16"
            >
              {[
                {
                  step: '01',
                  title: 'Envie seu edital',
                  description: 'Faça upload do edital do leilão e preencha informações básicas sobre o imóvel',
                  icon: FileText
                },
                {
                  step: '02',
                  title: 'Nossa equipe analisa',
                  description: 'Especialistas revisam cada detalhe do edital e identificam todos os pontos críticos',
                  icon: Zap
                },
                {
                  step: '03',
                  title: 'Receba o relatório em 48h',
                  description: 'Relatório completo e objetivo direto no seu WhatsApp ou e-mail',
                  icon: Clock
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`flex items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1 text-right md:text-left">
                    <div className={index % 2 === 1 ? 'md:text-right' : ''}>
                      <div className="inline-block px-4 py-1 bg-[#d4af37] text-black font-bold rounded-full mb-4">
                        Passo {item.step}
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                      <p className="text-gray-400 text-lg">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative flex-shrink-0 hidden md:block">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center relative z-10">
                      <item.icon className="w-10 h-10 text-black" />
                    </div>
                    <div className="absolute inset-0 bg-[#d4af37]/30 rounded-full blur-xl" />
                  </div>

                  <div className="flex-1" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Escolha seu plano
            </h2>
            <p className="text-xl text-gray-400">
              Soluções para cada necessidade e orçamento
            </p>
          </motion.div>

          {/* Discrete Free Preview Section */}
          <motion.div 
            variants={fadeInUp}
            className="max-w-3xl mx-auto mb-16"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-gray-900/30 border border-gray-800 hover:border-[#d4af37]/30 transition-all duration-300">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                  Comece com uma Degustação Gratuita
                </h3>
                <p className="text-gray-400 text-sm">
                  Receba um recorte essencial do edital (sem custos) para conhecer nossa análise antes de contratar.
                </p>
              </div>
              <div className="flex-shrink-0">
                 <button
                    onClick={() => handlePlanSelect('free_tasting')}
                    className="px-6 py-2 bg-transparent border border-[#d4af37] text-[#d4af37] text-sm font-semibold rounded-lg hover:bg-[#d4af37] hover:text-black transition-all duration-300 whitespace-nowrap"
                  >
                    Receber preview gratuito
                  </button>
              </div>
            </div>
          </motion.div>

          {/* Paid Plans Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Standard Plan */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group flex flex-col h-full"
            >
              <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-[#d4af37]/50 transition-all duration-300 h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{pricingPlans.standard.name}</h3>
                <p className="text-gray-400 mb-6 min-h-[50px]">{pricingPlans.standard.description}</p>
                
                <div className="mb-6">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[#d4af37]">R$ {pricingPlans.standard.price}</span>
                      <span className="text-gray-400">/análise</span>
                    </div>
                    <span className="text-sm text-gray-500 mt-1">Pagamento único</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {pricingPlans.standard.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect('standard')}
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-gray-800 text-white hover:bg-gray-700"
                >
                  Contratar
                </button>
              </div>
            </motion.div>

            {/* Express Plan (with Toggle) */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group flex flex-col h-full md:-mt-4"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-sm font-bold rounded-full flex items-center gap-1 z-20 shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                Mais Popular
              </div>

              <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-[#d4af37] shadow-2xl shadow-[#d4af37]/20 transition-all duration-300 h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{pricingPlans.express.name}</h3>
                <p className="text-gray-400 mb-4">{pricingPlans.express.description}</p>
                
                {/* Internal Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-800 p-1 rounded-lg inline-flex items-center">
                    <button
                      onClick={() => setExpressBilling('monthly')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        expressBilling === 'monthly' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Mensal
                    </button>
                    <button
                      onClick={() => setExpressBilling('annual')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        expressBilling === 'annual' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Anual
                    </button>
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[#d4af37]">
                        R$ {expressBilling === 'monthly' ? pricingPlans.express.price : pricingPlans.express_annual.price}
                      </span>
                      <span className="text-gray-400">
                        /{expressBilling === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </div>
                    {expressBilling === 'annual' && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                        {pricingPlans.express_annual.badge}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 mt-2">
                      {expressBilling === 'monthly' ? 'Cancele quando quiser' : 'Pagamento único anual'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {pricingPlans.express.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {expressBilling === 'annual' && (
                     <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                        <span className="text-green-400 font-bold">2 meses grátis</span>
                     </li>
                  )}
                </ul>

                <button
                  onClick={() => handlePlanSelect(expressBilling === 'monthly' ? 'express' : 'express_annual')}
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black hover:shadow-lg hover:shadow-[#d4af37]/50"
                >
                  Contratar
                </button>
              </div>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group flex flex-col h-full"
            >
              <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-[#d4af37]/50 transition-all duration-300 h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{pricingPlans.premium.name}</h3>
                <p className="text-gray-400 mb-6 min-h-[50px]">{pricingPlans.premium.description}</p>
                
                <div className="mb-6">
                   <div className="flex flex-col h-[76px] justify-center">
                     <span className="text-3xl font-bold text-[#d4af37]">Valor sob consulta</span>
                   </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {pricingPlans.premium.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect('premium')}
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-gray-800 text-white hover:bg-gray-700"
                >
                  Solicitar avaliação
                </button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="relative py-24 overflow-hidden">
        <GradientBackground variant="section" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Para quem é o Arrematando Certo?
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Investidores iniciantes',
                description: 'Que querem entrar no mercado de leilões com segurança e conhecimento'
              },
              {
                title: 'Investidores experientes',
                description: 'Que buscam agilidade e precisão na análise de múltiplas oportunidades'
              },
              {
                title: 'Compradores de primeira moradia',
                description: 'Que procuram oportunidades em leilões mas precisam de orientação clara'
              }
            ].map((audience, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-8 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-[#d4af37]/30 transition-all duration-300"
              >
                <Award className="w-12 h-12 text-[#d4af37] mb-4" />
                <h3 className="text-xl font-bold mb-3">{audience.title}</h3>
                <p className="text-gray-400">{audience.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Examples of Analysis Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Exemplos de Análises Realizadas
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Veja como nossa análise técnica identifica pontos críticos e traz clareza para sua decisão
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                type: 'Apartamento',
                location: 'São Paulo/SP',
                situation: 'Ocupação não mencionada no edital',
                risk: 'Imóvel ocupado sem informação clara',
                benefit: 'Cliente identificou necessidade de investigação prévia',
                icon: Building2
              },
              {
                type: 'Casa',
                location: 'Belo Horizonte/MG',
                situation: 'Dívida de IPTU acumulada',
                risk: 'Custos adicionais não previstos',
                benefit: 'Cliente calculou impacto real antes do lance',
                icon: Home
              },
              {
                type: 'Terreno',
                location: 'Curitiba/PR',
                situation: 'Prazo de pagamento muito curto',
                risk: 'Falta de tempo para financiamento',
                benefit: 'Cliente ajustou estratégia de lance',
                icon: Map
              },
              {
                type: 'Sala Comercial',
                location: 'Rio de Janeiro/RJ',
                situation: 'Multa por atraso de pagamento',
                risk: 'Penalidades contratuais',
                benefit: 'Cliente compreendeu obrigações antes de participar',
                icon: Briefcase
              }
            ].map((example, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="relative group h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                <div className="relative h-full bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-[#d4af37]/50 transition-all duration-300 flex flex-col">
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 gap-1">
                      <example.icon className="w-3 h-3" />
                      {example.type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {example.location}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-3 text-white">
                    {example.situation}
                  </h3>

                  <div className="space-y-3 flex-grow">
                    <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-400 font-bold uppercase mb-1">Ponto de Atenção</p>
                          <p className="text-sm text-gray-300">{example.risk}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-900/10 border border-green-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-green-400 font-bold uppercase mb-1">Benefício da Análise</p>
                          <p className="text-sm text-gray-300">{example.benefit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={fadeInUp} 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-xs text-gray-500 max-w-2xl mx-auto italic">
              * Os exemplos acima são ilustrativos, baseados em editais reais, e não representam promessa de resultado. Cada leilão possui particularidades que devem ser analisadas individualmente.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Differentials */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nossos diferenciais
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shield,
                title: 'Não damos sim ou não',
                description: 'Apresentamos todos os fatos para VOCÊ decidir com autonomia'
              },
              {
                icon: Target,
                title: 'Mostramos riscos reais',
                description: 'Baseado no edital oficial, não em suposições ou achismos'
              },
              {
                icon: FileText,
                title: 'Linguagem clara',
                description: 'Sem juridiquês - relatório que qualquer pessoa entende'
              }
            ].map((diff, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-[#d4af37]/50 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center mx-auto mb-4">
                    <diff.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{diff.title}</h3>
                  <p className="text-gray-400">{diff.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="relative py-16 overflow-hidden">
        <GradientBackground variant="section" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="p-8 bg-gray-900/30 rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 text-center leading-relaxed">
              <strong className="text-[#d4af37]">Aviso Legal:</strong> O Arrematando Certo fornece análise técnica de editais de leilão baseada exclusivamente nas informações contidas nos documentos fornecidos. Nossos relatórios não constituem consultoria jurídica ou recomendação de investimento. A decisão de participar do leilão é de sua exclusiva responsabilidade. Recomendamos consultar um advogado especializado antes de tomar qualquer decisão de compra.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#d4af37]/10 to-black" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para arrematar com{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                segurança
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Envie seu edital agora e receba análise profissional em até 48h
            </p>
            <Link
              to="/enviar-edital"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-lg font-bold rounded-lg hover:shadow-2xl hover:shadow-[#d4af37]/50 transition-all duration-300 hover:scale-105"
            >
              Enviar Edital Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;