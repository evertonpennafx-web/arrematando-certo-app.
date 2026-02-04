import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import GradientBackground from '@/components/ui/GradientBackground';

const SuccessPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Formulário Enviado - Arrematando Certo</title>
        <meta name="description" content="Seu formulário foi enviado com sucesso. Em breve entraremos em contato." />
      </Helmet>

      <div className="relative min-h-screen flex items-center justify-center py-16">
        <GradientBackground variant="default" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="w-24 h-24 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-black" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Formulário enviado{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                com sucesso!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-8"
            >
              Recebemos sua solicitação e já iniciamos o processo de análise do seu edital.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6 mb-8"
            >
              <div className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <Clock className="w-6 h-6 text-[#d4af37] flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-white mb-2">Próximos passos:</h3>
                  <ul className="text-gray-400 space-y-2">
                    <li>• Nossa equipe iniciará a análise detalhada do edital</li>
                    <li>• Você receberá o relatório completo em até 48 horas úteis</li>
                    <li>• O relatório será enviado conforme sua preferência de entrega</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <MessageCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h4 className="font-medium text-white text-sm mb-1">WhatsApp</h4>
                    <p className="text-gray-400 text-sm">Acompanhe o status em tempo real</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h4 className="font-medium text-white text-sm mb-1">E-mail</h4>
                    <p className="text-gray-400 text-sm">Verifique sua caixa de entrada</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/30">
                <p className="text-sm text-gray-300">
                  <strong className="text-[#d4af37]">Importante:</strong> Se tiver alguma dúvida ou 
                  precisar adicionar informações, entre em contato conosco pelo WhatsApp ou e-mail 
                  informados no formulário.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/50 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar para Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SuccessPage;