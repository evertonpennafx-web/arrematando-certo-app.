import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export const useSubmissionForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Section 1: Client Identification
    user_name: '',
    user_whatsapp: '',
    user_email: '',
    
    // Section 2: Service Selection
    service_type: '',
    plan_type: 'monthly', // 'monthly' or 'annual'
    order_number: '',
    
    // Section 3: Property/Auction Data
    property_type: '',
    city: '',
    state: '',
    neighborhood: '',
    auction_link: '',
    property_objective: '',
    
    // Section 4: Files
    edital_file: null,
    matricula_file: null,
    
    // Section 5: Precision Questions
    occupation_status: '',
    bid_ceiling: '',
    payment_method: '',
    
    // Section 6: Client Priorities
    priorities: [],
    
    // Section 7: Observations
    observations: '',
    
    // Section 9: Delivery Preference
    delivery_preference: '',
    
    // Section 10: Terms
    terms_accepted: false
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updatePriorities = (priority, checked) => {
    setFormData(prev => ({
      ...prev,
      priorities: checked
        ? [...prev.priorities, priority]
        : prev.priorities.filter(p => p !== priority)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Section 1 validation
    if (!formData.user_name.trim()) newErrors.user_name = 'Nome é obrigatório';
    if (!formData.user_whatsapp.trim()) newErrors.user_whatsapp = 'WhatsApp é obrigatório';
    if (!formData.user_email.trim()) {
      newErrors.user_email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = 'E-mail inválido';
    }

    // Section 2 validation
    if (!formData.service_type) newErrors.service_type = 'Selecione um plano';

    // Section 3 validation
    if (!formData.property_type) newErrors.property_type = 'Tipo de imóvel é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state) newErrors.state = 'Estado é obrigatório';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.auction_link.trim()) newErrors.auction_link = 'Link do leilão é obrigatório';
    if (!formData.property_objective) newErrors.property_objective = 'Objetivo é obrigatório';

    // Section 4 validation
    if (!formData.edital_file) newErrors.edital_file = 'Edital é obrigatório';

    // Section 5 validation
    if (!formData.occupation_status) newErrors.occupation_status = 'Status de ocupação é obrigatório';
    if (!formData.bid_ceiling.trim()) newErrors.bid_ceiling = 'Teto de lance é obrigatório';
    if (!formData.payment_method) newErrors.payment_method = 'Forma de pagamento é obrigatória';

    // Section 9 validation
    if (!formData.delivery_preference) newErrors.delivery_preference = 'Preferência de entrega é obrigatória';

    // Section 10 validation
    if (!formData.terms_accepted) newErrors.terms_accepted = 'Você deve aceitar os termos';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      // Local storage fallback for development/demo
      const submissionId = `submission_${Date.now()}`;
      
      const submissionData = {
        id: submissionId,
        ...formData,
        edital_file: formData.edital_file ? {
          name: formData.edital_file.name,
          size: formData.edital_file.size,
          type: formData.edital_file.type
        } : null,
        matricula_file: formData.matricula_file ? {
          name: formData.matricula_file.name,
          size: formData.matricula_file.size,
          type: formData.matricula_file.type
        } : null,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      const existingSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      existingSubmissions.push(submissionData);
      localStorage.setItem('submissions', JSON.stringify(existingSubmissions));

      toast({
        title: "Formulário enviado com sucesso!",
        description: `Plano selecionado: ${formData.service_type === 'express_annual' ? 'Anual' : 'Mensal'}. Em breve entraremos em contato.`,
      });

      setTimeout(() => {
        navigate('/sucesso');
      }, 1000);

      return true;
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Erro ao enviar formulário",
        description: "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updatePriorities,
    submitForm
  };
};