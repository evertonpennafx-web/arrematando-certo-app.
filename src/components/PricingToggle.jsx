import React from 'react';
import { motion } from 'framer-motion';

const PricingToggle = ({ billingCycle, onChange }) => {
  return (
    <div className="flex flex-col items-center justify-center mb-8 space-y-4">
      <div className="relative p-1 bg-gray-800 rounded-full inline-flex items-center shadow-inner border border-gray-700">
        <button
          onClick={() => onChange('monthly')}
          className={`relative px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 z-10 ${
            billingCycle === 'monthly' ? 'text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          {billingCycle === 'monthly' && (
            <motion.div
              layoutId="activePill"
              className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#f0d87f] rounded-full shadow-lg"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">Mensal</span>
        </button>

        <button
          onClick={() => onChange('annual')}
          className={`relative px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 z-10 ${
            billingCycle === 'annual' ? 'text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          {billingCycle === 'annual' && (
            <motion.div
              layoutId="activePill"
              className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#f0d87f] rounded-full shadow-lg"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            Anual
          </span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold rounded-full">
          Ganhe 2 meses grátis no plano anual
        </span>
      </motion.div>
    </div>
  );
};

export default PricingToggle;