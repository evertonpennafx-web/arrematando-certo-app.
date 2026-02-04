import React from 'react';
import { motion } from 'framer-motion';

const GradientBackground = ({ variant = 'default', className = '' }) => {
  const variants = {
    default: (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-900/10 via-transparent to-transparent" />
      </>
    ),
    hero: (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-transparent to-transparent" />
      </>
    ),
    section: (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, #d4af37 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, #d4af37 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, #d4af37 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </>
    ),
    card: (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 backdrop-blur-sm" />
    )
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {variants[variant]}
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212, 175, 55, 0.1) 35px, rgba(212, 175, 55, 0.1) 70px)`
        }} />
      </div>
    </div>
  );
};

export default GradientBackground;