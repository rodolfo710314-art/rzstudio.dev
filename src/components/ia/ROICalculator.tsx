'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SmartCard } from '@/components/ui/SmartCard';
import { SmartButton } from '@/components/ui/SmartButton';
import { TrendingUp, Clock, ArrowRight } from 'lucide-react';

export function ROICalculator() {
  const [budget, setBudget] = useState(10000);
  const [months, setMonths] = useState(6);

  // 62% cost reduction; 86% time saved.
  // ROI grows with months: fixed AI setup cost (38% of one month) is amortized over the project duration.
  const savings = useMemo(() => budget * 0.62, [budget]);
  const timeSaved = useMemo(() => months * 0.86, [months]);
  const roi = useMemo(() => {
    const setupCost = budget * 0.38; // one-time AI transition overhead
    const totalSavings = savings * months;
    const aiProjectCost = (budget - savings) * months + setupCost;
    const net = totalSavings - setupCost;
    return Math.max(0, Math.round((net / aiProjectCost) * 100));
  }, [savings, budget, months]);

  return (
    <SmartCard title="Calculadora de ROI con IA" className="max-w-4xl mx-auto overflow-visible font-mono text-xs lowercase">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        
        {/* CONTROLES */}
        <div className="space-y-8">
          <div>
            <label htmlFor="budget" className="flex justify-between font-mono text-[13px] text-slate-400 mb-4">
              <span>// presupuesto mensual actual (usd)</span>
              <span className="text-copper font-bold font-mono">${budget.toLocaleString()}</span>
            </label>
            <input
              id="budget"
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-none appearance-none cursor-pointer accent-copper"
            />
          </div>

          <div>
            <label htmlFor="months" className="flex justify-between font-mono text-[13px] text-slate-400 mb-4">
              <span>// duración estimada del proyecto (meses)</span>
              <span className="text-copper font-bold font-mono">{months} meses</span>
            </label>
            <input
              id="months"
              type="range"
              min="1"
              max="24"
              step="1"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-none appearance-none cursor-pointer accent-copper"
            />
          </div>

          <div className="p-4 bg-[#020202] rounded-none border border-slate-800">
            <p className="text-[12px] text-slate-500 italic">
              * cálculos basados en el benchmark promedio de implementación de rzstudio vs desarrollo tradicional.
            </p>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="grid grid-cols-1 gap-4 font-mono">
          <div className="relative group p-6 bg-[#0c0806] rounded-none border border-copper/30 overflow-hidden transition-all duration-300 hover:border-copper/70">
             <p className="text-slate-500 text-[12px] mb-1 uppercase tracking-widest font-bold font-mono">// ahorro mensual estimado</p>
             <h4 className="text-3xl font-bold text-white mb-2 font-mono">
                ${savings.toLocaleString()} <span className="text-xs font-normal text-slate-500">usd</span>
             </h4>
             <p className="text-copper text-[12px] flex items-center gap-2 font-mono">
                <TrendingUp size={12} /> +62% eficiencia de costos
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#020202] rounded-none border border-slate-800">
               <p className="text-slate-500 text-[11px] mb-1 uppercase tracking-widest font-mono">// tiempo ahorrado</p>
               <h4 className="text-xl font-bold text-white mb-1 font-mono">
                  {timeSaved.toFixed(1)} <span className="text-[12px] font-normal text-slate-500">meses</span>
               </h4>
               <p className="text-copper text-[11px] font-bold tracking-tighter uppercase font-mono">86% más rápido</p>
            </div>

            <div className="p-4 bg-[#020202] rounded-none border border-slate-800">
               <p className="text-slate-500 text-[11px] mb-1 uppercase tracking-widest font-mono">// roi proyectado</p>
               <h4 className="text-xl font-bold text-white mb-1 font-mono">
                  {roi}%
               </h4>
               <p className="text-copper text-[11px] font-bold tracking-tighter uppercase font-mono">exponencial</p>
            </div>
          </div>

          <Link href="/contacto" className="block w-full mt-2">
            <SmartButton variant="primary" size="lg" className="w-full">
              obtener reporte detallado <ArrowRight size={14} className="ml-2" />
            </SmartButton>
          </Link>
        </div>

      </div>
    </SmartCard>
  );
}
