'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Methodology = 'tradicional' | 'ia-asistido' | 'rz-agente';

interface MetricSet {
  time: string;
  cost: string;
  tests: string;
  debt: string;
  status: string;
  statusColor: string;
  efficiency: string;
  logs: string[];
}

const METRICS: Record<Methodology, MetricSet> = {
  tradicional: {
    time: '6.0 meses',
    cost: '$48,000 usd',
    tests: '45% cobertura',
    debt: 'alta (deuda crítica)',
    status: 'standby',
    statusColor: 'text-amber-600 border-amber-800/40',
    efficiency: '0% de optimización',
    logs: [
      '// compilar módulo manual...',
      '// error en pruebas de integración...',
      '// deuda acumulada: 120 horas de refactorización',
      '// esperando aprobación de infraestructura...'
    ]
  },
  'ia-asistido': {
    time: '2.5 meses',
    cost: '$24,000 usd',
    tests: '75% cobertura',
    debt: 'media (refactorización necesaria)',
    status: 'running',
    statusColor: 'text-amber-500 border-amber-700/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    efficiency: '50% optimizado',
    logs: [
      '// asistente copilot cargando sugerencias...',
      '// 35 advertencias en compilador...',
      '// tests de integridad autogenerados...',
      '// despliegue en staging completado...'
    ]
  },
  'rz-agente': {
    time: '0.8 meses',
    cost: '$8,500 usd',
    tests: '100% verificado',
    debt: 'nula (arquitectura polimórfica)',
    status: 'optimal',
    statusColor: 'text-copper border-copper shadow-[0_0_12px_#C97352]',
    efficiency: '86% de ahorro temporal',
    logs: [
      '// inicializando motor rz_studio...',
      '// compilación en sandbox aislada exitosa...',
      '// verificando 25 tests de integridad estricta...',
      '// sistema optimizado para hardware local (60fps)...',
      '// núcleo polimórfico activo.'
    ]
  }
};

export function TraditionalVsAI() {
  const [selected, setSelected] = useState<Methodology>('rz-agente');
  const activeMetrics = METRICS[selected];

  return (
    <div className="w-full max-w-4xl mx-auto border border-slate-800 bg-[#050505] p-6 font-mono text-xs lowercase relative">
      
      {/* HEADER DE LA TERMINAL */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 border border-slate-700 flex items-center justify-center">
            <span className={`w-1 h-1 ${selected === 'rz-agente' ? 'bg-copper animate-ping' : 'bg-slate-700'} rounded-none`} />
          </div>
          <span className="text-slate-400 tracking-wider font-bold">comp_system: tradicional_vs_ia</span>
        </div>
        <div className="text-[10px] text-slate-600">
          [hilo_activo: {selected}]
        </div>
      </div>

      {/* SELECTORES TERMINALES */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {(['tradicional', 'ia-asistido', 'rz-agente'] as Methodology[]).map((method) => {
          const isActive = selected === method;
          return (
            <button
              key={method}
              onClick={() => setSelected(method)}
              className={`
                py-3 text-[11px] tracking-widest border transition-all duration-300 font-mono relative
                ${isActive 
                  ? 'bg-transparent text-white border-copper shadow-[0_0_10px_rgba(201,115,82,0.25)]' 
                  : 'bg-transparent text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'}
              `}
            >
              {isActive && (
                <span className="absolute top-1 right-1 w-1 h-1 bg-copper rounded-none shadow-[0_0_4px_#C97352]" />
              )}
              {method === 'rz-agente' ? 'rz_agente // 2026' : method}
            </button>
          );
        })}
      </div>

      {/* COMPARATIVO DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        
        {/* PANEL IZQUIERDO: METRICAS CLAVE */}
        <div className="space-y-4">
          <div className="text-slate-400 font-bold uppercase tracking-wider mb-2 border-b border-slate-800/40 pb-1">
            [métricas_calculadas]
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-800/60 p-4 bg-[#0a0604]">
              <span className="text-slate-500 text-[10px] block mb-1">// tiempo de entrega</span>
              <span className="text-white text-base font-bold tracking-tight">{activeMetrics.time}</span>
            </div>

            <div className="border border-slate-800/60 p-4 bg-[#0a0604]">
              <span className="text-slate-500 text-[10px] block mb-1">// costo de ingeniería</span>
              <span className="text-white text-base font-bold tracking-tight">{activeMetrics.cost}</span>
            </div>

            <div className="border border-slate-800/60 p-4 bg-[#0a0604]">
              <span className="text-slate-500 text-[10px] block mb-1">// calidad del software</span>
              <span className="text-white text-sm font-bold tracking-tight">{activeMetrics.tests}</span>
            </div>

            <div className="border border-slate-800/60 p-4 bg-[#0a0604]">
              <span className="text-slate-500 text-[10px] block mb-1">// estado_deuda</span>
              <span className="text-white text-[11px] font-bold tracking-tighter truncate block">{activeMetrics.debt}</span>
            </div>
          </div>

          <div className="border border-slate-800 p-3 bg-slate-900/10 flex items-center justify-between">
            <span className="text-slate-500 text-[10px]">diagnóstico_eficiencia:</span>
            <span className={`font-bold ${selected === 'rz-agente' ? 'text-copper' : 'text-slate-300'}`}>
              {activeMetrics.efficiency}
            </span>
          </div>
        </div>

        {/* PANEL DERECHO: CONSOLA DE COMPILACIÓN SIMULADA */}
        <div className="border border-slate-800 p-4 bg-[#020202] relative overflow-hidden flex flex-col justify-between h-56 md:h-auto">
          <div className="absolute top-1 right-2 text-[9px] text-slate-700">[sistema_log]</div>
          
          <div className="space-y-2 overflow-hidden">
            <div className="text-slate-600 text-[10px] mb-2">// ejecutando simulación de proyecto...</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-1.5"
              >
                {activeMetrics.logs.map((log, i) => (
                  <div key={i} className="text-slate-400 text-[10px] font-mono leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    {log}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ESTADO LED DE CONTROL */}
          <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-[10px]">estado_motor:</span>
              <div className={`px-2 py-0.5 border text-[9px] uppercase tracking-wider font-bold ${activeMetrics.statusColor}`}>
                {activeMetrics.status}
              </div>
            </div>
            {selected === 'rz-agente' && (
              <span className="text-copper text-[9px] animate-pulse">// 100% polimórfico en verde</span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
