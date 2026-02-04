import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  Briefcase,
  Target,
  Shield,
  Users,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ConsultationForm from '@/components/ConsultationForm';

const ConsultationLandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <Layout>
      <Helmet>
        <title>Consultoria Estratégica - Arrematando Certo</title>
        <meta name="description" content="Assessoria personalizada para arrematações complexas e estratégicas." />
      </Helmet>

      <div className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1657373615623-64a12081af40"
            alt="Consultoria Executiva"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/80 to-black" />
        </div>
          
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* Back Navigation */}
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-[#d4af37] transition-colors mb-8">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar para Home
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Content Column */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-full mb-6">
                <span className="text-[#d4af37] font-bold tracking-wide text-sm uppercase">Valor sob consulta</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Consultoria <br />
                <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                  Estratégica
                </span> de Aquisição
              </h1>
              
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Um serviço exclusivo para investidores que buscam segurança jurídica e inteligência estratégica em arrematações de alta complexidade.
              </p>

              <div className="space-y-8">
                {[
                  {
                    icon: Users,
                    title: "Abordagem Personalizada",
                    description: "Atendimento direto e individualizado, focado nos seus objetivos de investimento e perfil de risco."
                  },
                  {
                    icon: Target,
                    title: "Análise Estratégica",
                    description: "Vamos além do óbvio. Avaliamos viabilidade econômica, riscos ocultos e estratégias de desocupação."
                  },
                  {
                    icon: Shield,
                    title: "Casos Específicos",
                    description: "Especialidade em leilões judiciais complexos, imóveis comerciais e grandes áreas."
                  },
                  {
                    icon: Briefcase,
                    title: "Avaliação Individual",
                    description: "Cada caso é tratado como único, com estudo aprofundado de toda a documentação e histórico processual."
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    variants={fadeInUp}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[#d4af37]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <ConsultationForm />
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsultationLandingPage;