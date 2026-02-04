import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  ArrowRight,
  Briefcase,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import Layout from '@/components/Layout';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/use-toast';
import { submitConsultationRequest } from '@/lib/supabase';

const ConsultationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    link: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    } else if (formData.whatsapp.replace(/\D/g, '').length < 10) {
      newErrors.whatsapp = 'Número inválido';
    }

    if (!formData.link.trim() && !formData.description.trim()) {
      newErrors.link = 'Forneça um link ou descreva o caso';
      newErrors.description = 'Forneça um link ou descreva o caso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro no formulário",
        description: "Verifique os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitConsultationRequest({
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        auction_link: formData.link,
        case_description: formData.description
      });

      toast({
        title: "Solicitação recebida!",
        description: "Entraremos em contato para apresentar a proposta.",
      });

      setTimeout(() => navigate('/sucesso-formulario'), 1000);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Consultoria Estratégica - Arrematando Certo</title>
        <meta name="description" content="Assessoria personalizada para arrematações complexas e estratégicas." />
      </Helmet>

      <div className="relative min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1657373615623-64a12081af40"
              alt="Consultoria Executiva"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Consultoria <span className="text-[#d4af37]">Estratégica</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Análise aprofundada e acompanhamento personalizado para casos de alta complexidade.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Info Column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-xl border border-[#d4af37]/30 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Serviço Premium</h3>
                  <div className="text-3xl font-bold text-[#d4af37] mb-6">Valor sob consulta</div>
                  
                  <p className="text-gray-400 mb-6">
                    Ideal para investidores que buscam não apenas uma análise de risco, mas uma estratégia completa de aquisição.
                  </p>

                  <ul className="space-y-4">
                    {[
                      'Atendimento personalizado',
                      'Análise estratégica individual',
                      'Indicado para casos específicos',
                      'Suporte prioritário',
                      'Reunião de alinhamento'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-[#d4af37]" />
                  Solicitar Avaliação do Caso
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <FormField 
                    label="Nome completo"
                    placeholder="Seu nome"
                    icon={User}
                    required
                    value={formData.name}
                    onChange={v => {
                      setFormData(prev => ({ ...prev, name: v }));
                      if(errors.name) setErrors(prev => ({...prev, name: ''}));
                    }}
                    error={errors.name}
                  />
                  
                  <FormField 
                    label="WhatsApp"
                    placeholder="(00) 00000-0000"
                    icon={Phone}
                    required
                    value={formData.whatsapp}
                    onChange={v => {
                      setFormData(prev => ({ ...prev, whatsapp: v }));
                      if(errors.whatsapp) setErrors(prev => ({...prev, whatsapp: ''}));
                    }}
                    error={errors.whatsapp}
                  />
                </div>

                <div className="mb-6">
                  <FormField 
                    label="E-mail"
                    placeholder="seu@email.com"
                    icon={Mail}
                    type="email"
                    required
                    value={formData.email}
                    onChange={v => {
                      setFormData(prev => ({ ...prev, email: v }));
                      if(errors.email) setErrors(prev => ({...prev, email: ''}));
                    }}
                    error={errors.email}
                  />
                </div>

                <div className="space-y-6 mb-8">
                  <FormField 
                    label="Link do Leilão (Opcional)"
                    placeholder="https://..."
                    icon={LinkIcon}
                    value={formData.link}
                    onChange={v => {
                      setFormData(prev => ({ ...prev, link: v }));
                      if(errors.link) setErrors(prev => ({...prev, link: '', description: ''}));
                    }}
                    error={errors.link}
                  />
                  
                  <FormField 
                    label="Descrição do Caso / Necessidade"
                    placeholder="Descreva brevemente sua situação ou o que busca nesta consultoria..."
                    icon={MessageSquare}
                    multiline
                    value={formData.description}
                    onChange={v => {
                      setFormData(prev => ({ ...prev, description: v }));
                      if(errors.description) setErrors(prev => ({...prev, description: '', link: ''}));
                    }}
                    error={errors.description}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Solicitar avaliação
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsultationPage;