import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import GradientBackground from '@/components/ui/GradientBackground';

const FormSuccessPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Solicitação Enviada - Arrematando Certo</title>
      </Helmet>
      
      <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden px-4">
        <GradientBackground variant="section" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-lg w-full bg-gray-900/50 backdrop-blur-xl p-8 md:p-12 rounded-2xl border border-[#d4af37]/30 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#d4af37]" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-white">Solicitação Recebida!</h1>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            Recebemos suas informações com sucesso. Nossa equipe analisará os dados e entrará em contato em breve através do WhatsApp ou e-mail fornecido.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/40 transition-all duration-300 hover:scale-105"
          >
            Voltar para a Home
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default FormSuccessPage;