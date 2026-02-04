import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import GradientBackground from '@/components/ui/GradientBackground';

const PaymentCancel = () => {
  return (
    <Layout>
      <Helmet>
        <title>Pagamento Cancelado - Arrematando Certo</title>
        <meta name="description" content="O pagamento foi cancelado." />
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
              className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-12 h-12 text-gray-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Pagamento{' '}
              <span className="text-gray-400">
                Cancelado
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-8"
            >
              Não se preocupe! Você pode tentar novamente quando quiser.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <p className="text-gray-300 mb-6">
                Nenhuma cobrança foi realizada. Se você mudou de ideia ou teve algum problema, 
                estamos aqui para ajudar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar para Home
                </Link>

                <Link
                  to="/#pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/50 transition-all duration-300"
                >
                  Ver Planos Novamente
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancel;