'use client';

import React, { ReactNode } from 'react';
import { useHardware } from '@/context/HardwareContext';
import { motion, HTMLMotionProps } from 'framer-motion';

interface SmartCardProps extends HTMLMotionProps<'div'> {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function SmartCard({ title, children, icon, className = '', ...props }: SmartCardProps) {
  const { config } = useHardware();

  const isHighEnd = config.animationComplexity === 'high';

  // Animaciones adaptativas con tipos corregidos
  const animationProps: HTMLMotionProps<'div'> = isHighEnd ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: "easeOut" },
    whileHover: { y: -8, transition: { duration: 0.2 } }
  } : {};

  return (
    <motion.div
      {...animationProps}
      {...props}
      className={`
        relative overflow-hidden group
        p-6 rounded-none
        bg-[#050505] border border-slate-800
        transition-all duration-300
        hover:border-copper hover:shadow-[0_0_15px_rgba(201,115,82,0.15)]
        ${config.useBlur ? 'glass' : ''}
        ${className}
      `}
    >
      {/* Eliminamos el círculo de luz de fondo flotante circular */}

      {icon && (
        <div className="w-10 h-10 border border-slate-800 flex items-center justify-center mb-6 text-slate-400 group-hover:text-copper group-hover:border-copper group-hover:shadow-[0_0_10px_rgba(201,115,82,0.4)] transition-all duration-300">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement, { strokeWidth: 1, fill: "none" } as any)
            : icon}
        </div>
      )}

      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
        {title}
      </h3>

      <div className="text-slate-400 leading-relaxed text-sm">
        {children}
      </div>
    </motion.div>
  );
}
