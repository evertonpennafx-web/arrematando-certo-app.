
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  Package, 
  Home, 
  MapPin, 
  Link as LinkIcon,
  DollarSign,
  CheckSquare,
  MessageSquare,
  Send,
  AlertCircle,
  Check,
  Star
} from 'lucide-react';
import Layout from '@/components/Layout';
import GradientBackground from '@/components/ui/GradientBackground';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useSubmissionForm } from '@/hooks/useSubmissionForm';
import { pricingPlans, redirectToCheckout } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';
import { submitPaidSubmission, uploadPdfToStorage } from '@/lib/supabase';
import PricingToggle from '@/components/PricingToggle';
import PdfUploadField from '@/components/PdfUploadField';

const SubmissionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, updateField, updatePriorities } = useSubmissionForm();
  
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId && pricingPlans[planId]) {
      // If user comes from a link with express_annual or express
      if (planId === 'express_annual') {
        setBillingCycle('annual');
        updateField('service_type', 'express_annual');
      } else if (planId === 'express') {
        setBillingCycle('monthly');
        updateField('service_type', 'express');
      } else if (pricingPlans[planId].type !== 'consultation') {
        updateField('service_type', planId);
      } else if (pricingPlans[planId].type === 'consultation') {
        updateField('service_type', planId);
      }
    }
  }, [searchParams]);

  // Sync plan type with billing cycle when toggled (ONLY for Express)
  const handleBillingCycleChange = (cycle) => {
    setBillingCycle(cycle);
    // If we are currently on an Express plan, switch the selected service type
    if (formData.service_type === 'express' || formData.service_type === 'express_annual') {
      updateField('service_type', cycle === 'annual' ? 'express_annual' : 'express');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.user_name) newErrors.user_name = 'Nome é obrigatório';
    if (!formData.user_email) newErrors.user_email = 'E-mail é obrigatório';
    if (!formData.user_whatsapp) newErrors.user_whatsapp = 'WhatsApp é obrigatório';
    if (!formData.service_type) newErrors.service_type = 'Selecione um plano';
    if (!formData.auction_link) newErrors.auction_link = 'Link do leilão é obrigatório';
    if (!formData.edital_file) newErrors.edital_file = 'Upload do edital é obrigatório';
    if (!formData.delivery_preference) newErrors.delivery_preference = 'Selecione a forma de entrega';
    if (!formData.terms_accepted) newErrors.terms_accepted = 'Você deve aceitar os termos';

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaidSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro no formulário",
        description: "Verifique os campos obrigatórios assinalados.",
        variant: "destructive"
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 0. Upload PDF(s)
      let pdfUrl = null;
      if (formData.edital_file) {
          toast({
             title: "Enviando edital...",
             description: "Fazendo upload do arquivo PDF para análise.",
          });
          pdfUrl = await uploadPdfToStorage(formData.edital_file, 'paid_submissions');
      }
      
      // Note: We currently only save one pdf_url. If matricula is uploaded, we might want to upload it too.
      // But for now, we follow the requirement to save pdf_url for the main file.
      // We'll mention the matricula in the documents list string.

      // 1. Prepare Data for Supabase
      const documentsList = [];
      if (formData.auction_link) documentsList.push(`Link: ${formData.auction_link}`);
      if (formData.edital_file) documentsList.push(`Edital: ${formData.edital_file.name}`);
      if (formData.matricula_file) documentsList.push(`Matrícula: ${formData.matricula_file.name}`);

      const plan = pricingPlans[formData.service_type];
      
      const submissionData = {
        nome: formData.user_name,
        email: formData.user_email,
        whatsapp: formData.user_whatsapp,
        plano: formData.service_type,
        plan_type: plan.billing || 'one-time', 
        documentos: documentsList,
        descricao: `
          Imóvel: ${formData.property_type} em ${formData.city}/${formData.state}.
          Objetivo: ${formData.property_objective}.
          Ocupação: ${formData.occupation_status}.
          Teto de lance: ${formData.bid_ceiling}.
          Forma de pagto: ${formData.payment_method}.
          Observações: ${formData.observations || 'Nenhuma'}.
          Prioridades: ${formData.priorities.join(', ')}.
        `.trim(),
        pdf_url: pdfUrl // Passed here
      };

      // 2. Save to Supabase (Syncs with paid_submissions table)
      const { success, id } = await submitPaidSubmission(submissionData);

      if (success && id) {
         if (plan.priceId) {
             // Standard / Express Plans with Stripe
             toast({
                title: "Dados salvos!",
                description: `Processando pagamento do plano ${plan.name}...`,
             });

             const successUrl = `${window.location.origin}/pagamento-sucesso?submission_id=${id}&plan=${formData.service_type}`;
             const cancelUrl = `${window.location.origin}/pagamento-cancelado`;

             await redirectToCheckout(plan.priceId, successUrl, cancelUrl);
         } else {
             // Premium / Consultation (No Stripe)
             toast({
                title: "Solicitação Enviada!",
                description: `Recebemos seu pedido de consultoria. Entraremos em contato em breve.`,
             });
             navigate('/sucesso-formulario');
         }
      }

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Erro ao processar",
        description: "Ocorreu um erro ao salvar seus dados. Tente novamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const propertyTypes = ['Apartamento', 'Casa', 'Terreno', 'Sala Comercial', 'Galpão', 'Loja', 'Outro'];
  const propertyObjectives = ['Moradia própria', 'Investimento para aluguel', 'Revenda', 'Uso comercial', 'Outro'];
  const occupationStatuses = ['Ocupado pelo devedor', 'Ocupado por terceiros', 'Desocupado', 'Não informado', 'Não sei'];
  const paymentMethods = ['À vista', 'Financiamento bancário', 'Recursos próprios + financiamento', 'Ainda não sei'];
  
  const prioritiesList = [
    { id: 'ocupacao', label: 'Situação de ocupação do imóvel' },
    { id: 'dividas', label: 'Dívidas e ônus sobre o imóvel' },
    { id: 'prazo', label: 'Prazo para regularização' },
    { id: 'custos', label: 'Custos totais envolvidos' },
    { id: 'multas', label: 'Multas e penalidades' },
    { id: 'risco', label: 'Riscos jurídicos' }
  ];

  const deliveryPreferences = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'E-mail' },
    { value: 'both', label: 'Ambos (WhatsApp e E-mail)' }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  const InputField = ({ label, icon: Icon, error, children, required = false }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-[#d4af37] font-medium">
        {Icon && <Icon className="w-4 h-4 text-[#d4af37]" />}
        {label}
        {required && <span className="text-[#d4af37]">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-[#d4af37] flex items-center gap-2 bg-black/50 p-2 rounded border border-[#d4af37]/30">
          <AlertCircle className="w-4 h-4 text-[#d4af37]" />
          {error}
        </p>
      )}
    </div>
  );

  const Section = ({ title, description, children, number }) => (
    <motion.div {...fadeInUp} className="mb-12">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center font-bold text-black text-lg shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          {number}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
          {description && <p className="text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="ml-16 space-y-6">
        {children}
      </div>
    </motion.div>
  );

  // Helper to determine if we should show toggle
  const isExpressPlan = formData.service_type === 'express' || formData.service_type === 'express_annual';
  const selectedPlan = pricingPlans[formData.service_type];

  return (
    <Layout>
      <Helmet>
        <title>Enviar Edital - Arrematando Certo</title>
        <meta name="description" content="Envie seu edital de leilão para análise profissional. Receba um relatório completo em até 48 horas." />
      </Helmet>

      <div className="relative min-h-screen py-16">
        <GradientBackground variant="default" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Envie seu{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                Edital
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Preencha as informações abaixo para recebermos seu edital
            </p>
          </motion.div>

          <div className="bg-black/90 backdrop-blur-sm rounded-2xl border border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.1)] p-8 md:p-12">
            {/* Section 1: Client Identification */}
            <Section number="1" title="Suas Informações" description="Precisamos destes dados para entrar em contato">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField label="Nome completo" icon={User} error={localErrors.user_name} required>
                  <input
                    type="text"
                    value={formData.user_name}
                    onChange={(e) => updateField('user_name', e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-gray-600"
                    placeholder="Seu nome completo"
                  />
                </InputField>

                <InputField label="WhatsApp" icon={Phone} error={localErrors.user_whatsapp} required>
                  <input
                    type="tel"
                    value={formData.user_whatsapp}
                    onChange={(e) => updateField('user_whatsapp', e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-gray-600"
                    placeholder="(00) 00000-0000"
                  />
                </InputField>
              </div>

              <InputField label="E-mail" icon={Mail} error={localErrors.user_email} required>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => updateField('user_email', e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-gray-600"
                  placeholder="seu@email.com"
                />
              </InputField>
            </Section>

            {/* Section 2: Selected Plan */}
            <Section number="2" title="Plano Selecionado" description="Confira o plano que você escolheu">
              
              {/* If Express, show Toggle */}
              {isExpressPlan && (
                <PricingToggle billingCycle={billingCycle} onChange={handleBillingCycleChange} />
              )}
              
              <InputField label="Detalhes do Plano" icon={Package} error={localErrors.service_type} required>
                {selectedPlan ? (
                  <div className={`p-6 border rounded-xl transition-all duration-300 relative overflow-hidden bg-black ${
                    isExpressPlan 
                      ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                      : 'border-gray-800'
                  }`}>
                    {/* Badge for Express Annual */}
                    {selectedPlan.badge && (
                      <div className="absolute top-0 right-0 bg-[#d4af37] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                        {selectedPlan.badge}
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white text-xl flex items-center gap-2">
                          {selectedPlan.name}
                          {selectedPlan.popular && <Star className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />}
                        </h3>
                        <p className="text-gray-400 mt-1">{selectedPlan.description}</p>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                         <span className="text-[#d4af37] font-bold text-2xl">
                           {selectedPlan.price.includes('consulta') ? 'Sob Consulta' : `R$ ${selectedPlan.price}`}
                         </span>
                         {selectedPlan.savings && (
                            <span className="text-[#d4af37] text-xs font-bold mt-1">{selectedPlan.savings}</span>
                         )}
                         {selectedPlan.period && (
                            <span className="text-gray-500 text-xs mt-1">/{selectedPlan.period}</span>
                         )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#d4af37]/20">
                        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gray-300">
                          {selectedPlan.features.slice(0, 4).map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-[#d4af37] bg-black rounded-lg text-[#d4af37]">
                    Nenhum plano selecionado. Por favor, volte à página inicial e escolha um plano.
                  </div>
                )}
              </InputField>
            </Section>

            {/* Section 3: Property/Auction Data */}
            <Section number="3" title="Informações do Imóvel" description="Dados sobre o imóvel e o leilão">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField label="Tipo de imóvel" icon={Home} error={localErrors.property_type} required>
                  <select
                    value={formData.property_type}
                    onChange={(e) => updateField('property_type', e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white"
                  >
                    <option value="">Selecione...</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Cidade" icon={MapPin} error={localErrors.city} required>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-gray-600"
                    placeholder="Nome da cidade"
                  />
                </InputField>

                <InputField label="Estado" icon={MapPin} error={localErrors.state} required>
                  <select
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white"
                  >
                    <option value="">Selecione...</option>
                    {brazilianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Bairro" icon={MapPin} error={localErrors.neighborhood} required>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => updateField('neighborhood', e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-gray-600"
                    placeholder="Nome do bairro"
                  />
                </InputField>
              </div>

              <InputField label="Link do leilão" icon={LinkIcon} error={localErrors.auction_link} required>
                <input
                  type="url"
                  value={formData.auction_link}
                  onChange={(e) => updateField('auction_link', e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-gray-600"
                  placeholder="https://..."
                />
              </InputField>

              <InputField label="Seu objetivo com o imóvel" icon={Home} error={localErrors.property_objective} required>
                <select
                  value={formData.property_objective}
                  onChange={(e) => updateField('property_objective', e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white"
                >
                  <option value="">Selecione...</option>
                  {propertyObjectives.map(obj => (
                    <option key={obj} value={obj}>{obj}</option>
                  ))}
                </select>
              </InputField>
            </Section>

            {/* Section 4: File Upload */}
            <Section number="4" title="Documentos" description="Envie o edital e, se tiver, a matrícula do imóvel">
              <div className="space-y-6">
                <PdfUploadField 
                    label="Edital do leilão (PDF)" 
                    required={true}
                    onFileSelect={(file) => updateField('edital_file', file)}
                    error={localErrors.edital_file}
                />

                <PdfUploadField 
                    label="Matrícula do imóvel (opcional - PDF)" 
                    onFileSelect={(file) => updateField('matricula_file', file)}
                    error={null}
                />
              </div>
            </Section>

            {/* Section 5: Precision Questions */}
            <Section number="5" title="Perguntas de Precisão" description="Informações que nos ajudam a personalizar a análise">
              <InputField label="Status de ocupação" icon={Home} error={localErrors.occupation_status} required>
                <select
                  value={formData.occupation_status}
                  onChange={(e) => updateField('occupation_status', e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white"
                >
                  <option value="">Selecione...</option>
                  {occupationStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </InputField>

              <InputField label="Teto de lance (quanto pretende investir)" icon={DollarSign} error={localErrors.bid_ceiling} required>
                <input
                  type="text"
                  value={formData.bid_ceiling}
                  onChange={(e) => updateField('bid_ceiling', e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white placeholder-gray-600"
                  placeholder="Ex: R$ 250.000,00"
                />
              </InputField>

              <InputField label="Forma de pagamento pretendida" icon={DollarSign} error={localErrors.payment_method} required>
                <select
                  value={formData.payment_method}
                  onChange={(e) => updateField('payment_method', e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white"
                >
                  <option value="">Selecione...</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </InputField>
            </Section>

            {/* Section 6: Client Priorities */}
            <Section number="6" title="Suas Prioridades" description="Selecione os aspectos mais importantes para você">
              <InputField label="O que mais te preocupa?" icon={CheckSquare}>
                <div className="space-y-3">
                  {prioritiesList.map(priority => (
                    <label
                      key={priority.id}
                      className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg hover:border-[#d4af37] cursor-pointer transition-colors bg-black"
                    >
                      <Checkbox
                        checked={formData.priorities.includes(priority.id)}
                        onCheckedChange={(checked) => updatePriorities(priority.id, checked)}
                        className="mt-1 accent-[#d4af37]"
                      />
                      <span className="text-gray-300">{priority.label}</span>
                    </label>
                  ))}
                </div>
              </InputField>
            </Section>

            {/* Section 7: Observations */}
            <Section number="7" title="Observações" description="Alguma informação adicional que queira nos passar?">
              <InputField label="Comentários ou dúvidas" icon={MessageSquare}>
                <textarea
                  value={formData.observations}
                  onChange={(e) => updateField('observations', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-white resize-y min-h-[100px] placeholder-gray-600"
                  placeholder="Escreva aqui qualquer informação adicional que considere importante..."
                />
              </InputField>
            </Section>

            {/* Section 8: Delivery Information */}
            <Section number="8" title="Informações de Entrega">
              <div className="p-6 bg-black border border-[#d4af37]/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Prazo de entrega: até 48 horas</h3>
                    <p className="text-gray-400 text-sm">
                      Após o envio deste formulário, nossa equipe iniciará a análise do seu edital. 
                      O relatório completo será enviado em até 48 horas úteis, conforme sua preferência 
                      de entrega selecionada abaixo.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Section 9: Delivery Preference */}
            <Section number="9" title="Preferência de Entrega" description="Como prefere receber o relatório?">
              <InputField label="Enviar relatório por" icon={Send} error={localErrors.delivery_preference} required>
                <div className="space-y-3">
                  {deliveryPreferences.map(pref => (
                    <label
                      key={pref.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-300 bg-black ${
                        formData.delivery_preference === pref.value
                          ? 'border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                          : 'border-gray-800 hover:border-[#d4af37]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_preference"
                        value={pref.value}
                        checked={formData.delivery_preference === pref.value}
                        onChange={(e) => updateField('delivery_preference', e.target.value)}
                        className="accent-[#d4af37]"
                      />
                      <span className="ml-3 text-white">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </InputField>
            </Section>

            {/* Section 10: Terms */}
            <Section number="10" title="Termos e Condições">
              <InputField error={localErrors.terms_accepted}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.terms_accepted}
                    onCheckedChange={(checked) => updateField('terms_accepted', checked)}
                    className="mt-1 accent-[#d4af37]"
                  />
                  <span className="text-gray-300 text-sm">
                    Declaro que li e concordo com os termos de serviço. Entendo que a análise 
                    fornecida é baseada exclusivamente nas informações do edital e não constitui 
                    consultoria jurídica ou recomendação de investimento. A decisão de participar 
                    do leilão é de minha exclusiva responsabilidade.
                  </span>
                </label>
              </InputField>
            </Section>

            {/* Summary & Submit */}
            <motion.div {...fadeInUp} className="mt-12">
               {selectedPlan && (
                  <div className="mb-6 p-4 bg-black border border-[#d4af37] rounded-lg text-center shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                     <p className="text-gray-400 text-sm">Confirmar plano:</p>
                     <p className="text-[#d4af37] font-bold text-xl my-1">
                        {selectedPlan.name}
                     </p>
                     <p className="text-white font-bold">
                        {selectedPlan.price.includes('consulta') ? 'Sob Consulta' : `R$ ${selectedPlan.price}`}
                     </p>
                  </div>
               )}

              <Button
                onClick={handlePaidSubmit}
                disabled={isSubmitting || !selectedPlan}
                className="w-full py-6 bg-[#d4af37] hover:bg-[#b8941f] text-black text-lg font-bold uppercase tracking-wide rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    {selectedPlan?.price.includes('consulta') ? 'Enviar Solicitação' : 'Ir para Pagamento'}
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubmissionPage;
