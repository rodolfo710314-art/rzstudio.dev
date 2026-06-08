'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useHardware } from '@/context/HardwareContext';
import { motion, HTMLMotionProps } from 'framer-motion';

// Omitimos los eventos que colisionan entre HTMLButtonElement y Motion
type CombinedProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>> & HTMLMotionProps<'button'>;

interface SmartButtonProps extends CombinedProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function SmartButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: SmartButtonProps) {
  const { config } = useHardware();

  const isHighEnd = config.animationComplexity === 'high';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs tracking-wider',
    md: 'px-6 py-2.5 text-sm tracking-wider',
    lg: 'px-8 py-3 text-sm tracking-widest',
  };

  const variantStyles = {
    primary: 'bg-[#050505] border border-copper text-white shadow-[0_0_8px_rgba(201,115,82,0.15)] hover:shadow-[0_0_18px_rgba(201,115,82,0.65)] hover:border-copper transition-all duration-300',
    secondary: 'bg-[#050505] border border-roast text-slate-300 hover:text-white hover:border-amber shadow-[0_0_8px_rgba(138,91,62,0.1)] hover:shadow-[0_0_18px_rgba(164,103,71,0.4)] transition-all duration-300',
    outline: 'bg-transparent border border-slate-800 text-slate-400 hover:text-white hover:border-copper hover:shadow-[0_0_12px_rgba(201,115,82,0.3)] transition-all duration-300',
  };

  const animationProps = isHighEnd ? {
    whileHover: { y: -1 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring' as const, stiffness: 500, damping: 15 }
  } : {};

  return (
    <motion.button
      {...animationProps}
      className={`
        relative inline-flex items-center justify-center
        font-mono lowercase rounded-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Eliminamos el gradiente brillante circular */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
