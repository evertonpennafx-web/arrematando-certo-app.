import React from 'react';
import { redirectToCheckout, pricingPlans } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

const StripeCheckout = ({ planId, children, className = '' }) => {
  const { toast } = useToast();

  const handleCheckout = async () => {
    const plan = pricingPlans[planId];
    
    if (!plan) {
      toast({
        title: "Erro",
        description: "Plano não encontrado.",
        variant: "destructive"
      });
      return;
    }

    try {
      const successUrl = `${window.location.origin}/pagamento-sucesso`;
      const cancelUrl = `${window.location.origin}/pagamento-cancelado`;

      await redirectToCheckout(plan.priceId, successUrl, cancelUrl);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao redirecionar para o checkout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div onClick={handleCheckout} className={className}>
      {children}
    </div>
  );
};

export default StripeCheckout;