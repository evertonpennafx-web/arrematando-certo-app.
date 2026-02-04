import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import GradientBackground from '@/components/ui/GradientBackground';

const PaymentSuccess = () => {
  return (
    <Layout>
      <Helmet>
        <title>Pagamento Confirmado - Arrematando Certo</title>
        <meta name="description" content="Seu pagamento foi processado com sucesso." />
      </Helmet>

      <div className="relative min-h-screen flex items-center justify-center py-16">
        <GradientBackground variant="default" />
        
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 md:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Pagamento{' '}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Confirmado!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-8"
            >
              Seu pagamento foi processado com sucesso. Agora você pode enviar seu edital para análise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <p className="text-gray-300 mb-6">
                Você receberá um e-mail de confirmação com os detalhes do pedido e 
                instruções para enviar seu edital.
              </p>

              <Link
                to="/enviar-edital"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-lg font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/50 transition-all duration-300 hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                Enviar Edital Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;