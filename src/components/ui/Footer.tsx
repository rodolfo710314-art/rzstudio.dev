'use client';

import React from 'react';
import Link from 'next/link';
import { useHardware } from '@/context/HardwareContext';

export function Footer() {
  const { tier, config } = useHardware();

  return (
    <footer className="border-t border-[#1D140F] bg-[#050505] py-12 text-slate-500 font-mono text-xs lowercase">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* DIAGNÓSTICOS DEL SISTEMA */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 text-copper font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 bg-copper animate-pulse rounded-none" />
            rz_core_diagnostics
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-500">
            <div>[hardware_tier]: <span className="text-slate-300 font-bold">{tier}</span></div>
            <div>[animation_complexity]: <span className="text-slate-300">{config.animationComplexity}</span></div>
            <div>[particle_density]: <span className="text-slate-300">{config.particleCount}u</span></div>
            <div>[acceleration]: <span className="text-slate-300">{config.useBlur ? 'active' : 'fallback'}</span></div>
            <div>[system_engine]: <span className="text-slate-300">v14.2.6-stable</span></div>
            <div>[connection_state]: <span className="text-emerald-500">established</span></div>
          </div>
          <p className="text-[10px] text-slate-600 mt-4 leading-relaxed max-w-sm">
            rzstudio es una terminal interactiva de ingeniería de software aumentada por modelos multimodales cooperativos.
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <div>
          <div className="text-slate-400 font-bold mb-3 uppercase tracking-wider">[páginas]</div>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-copper transition-colors">// inicio</Link></li>
            <li><Link href="/la-estrella" className="hover:text-copper transition-colors">// la estrella</Link></li>
            <li><Link href="/servicios" className="hover:text-copper transition-colors">// servicios</Link></li>
            <li><Link href="/portfolio" className="hover:text-copper transition-colors">// portfolio</Link></li>
            <li><Link href="/proceso" className="hover:text-copper transition-colors">// proceso</Link></li>
            <li><Link href="/simbiosis" className="hover:text-copper transition-colors">// simbiosis</Link></li>
            <li><Link href="/ia" className="hover:text-copper transition-colors">// ia</Link></li>
            <li><Link href="/blog" className="hover:text-copper transition-colors">// blog</Link></li>
          </ul>
        </div>

        {/* OTROS */}
        <div>
          <div className="text-slate-400 font-bold mb-3 uppercase tracking-wider">[contacto]</div>
          <ul className="space-y-2">
            <li><Link href="/contacto" className="hover:text-copper transition-colors">// contacto</Link></li>
            <li>
              <span className="text-slate-600">© {new Date().getFullYear()} rzstudio //</span>
            </li>
            <li>
              <span className="text-slate-600">[hecho con simbiosis humana-ia]</span>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
