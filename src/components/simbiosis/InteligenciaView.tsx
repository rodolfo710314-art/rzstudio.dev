'use client';

import { motion } from 'framer-motion';
import { Brain, Cpu, GitBranch, Zap } from 'lucide-react';

interface InteligenciaViewProps {
  onActivate: () => void;
}

const STATS = [
  { label: 'agentes activos', value: '6', unit: 'en beta' },
  { label: 'ciclos de auditoría', value: '4.291', unit: 'completados' },
  { label: 'reducción deuda técnica', value: '67%', unit: 'promedio' },
  { label: 'latencia de respuesta', value: '<100', unit: 'ms' },
] as const;

const CAPABILITIES = [
  {
    icon: Brain,
    label: 'razonamiento multi-paso',
    desc: 'los agentes descomponen problemas complejos en tareas atómicas y los resuelven en cadena verificada.',
  },
  {
    icon: GitBranch,
    label: 'rollback automático',
    desc: 'el sistema revierte cambios que degraden métricas clave de forma instantánea sin intervención humana.',
  },
  {
    icon: Cpu,
    label: 'verificación cruzada',
    desc: 'múltiples agentes especializados validan la solución de forma independiente antes de proponer un merge.',
  },
  {
    icon: Zap,
    label: 'orquestación dinámica',
    desc: 'el orquestador asigna tareas en tiempo real según la carga, especialización y disponibilidad de cada agente.',
  },
] as const;

export function InteligenciaView({ onActivate }: InteligenciaViewProps) {
  return (
    <div className="space-y-14">
      {/* Intro */}
      <div className="max-w-2xl">
        <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-3">
          // descripción del sistema
        </span>
        <p className="font-mono text-sm text-slate-400 leading-relaxed lowercase">
          simbiosis es el laboratorio de investigación y desarrollo de rzstudio — un entorno donde agentes
          de ia trabajan de forma autónoma, coordinada y verificable para construir, auditar y optimizar
          software en tiempo real.
        </p>
        <p className="font-mono text-xs text-slate-600 leading-relaxed lowercase mt-3">
          el sistema opera en modo de inteligencia adaptativa por defecto. activa el núcleo simbiótico
          para acceder al sandbox interactivo completo con los 6 proyectos beta en ejecución.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-slate-800 bg-slate-800">
        {STATS.map(({ label, value, unit }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="p-5 bg-[#030303]"
          >
            <div className="font-mono text-2xl font-bold text-white tabular-nums">{value}</div>
            <div className="font-mono text-[8px] text-slate-700 uppercase tracking-wider mt-0.5">{unit}</div>
            <div className="w-4 h-[1px] bg-copper mt-2.5 mb-1.5" />
            <div className="font-mono text-[10px] text-slate-600 lowercase">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Capabilities */}
      <div>
        <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-6">
          // capacidades del núcleo
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CAPABILITIES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="border border-slate-800 p-4 flex gap-4 bg-black/20">
              <div className="w-8 h-8 border border-slate-800 flex items-center justify-center text-copper flex-shrink-0">
                <Icon className="w-4 h-4" strokeWidth={1} />
              </div>
              <div>
                <div className="font-mono text-xs text-white lowercase mb-1">{label}</div>
                <p className="font-mono text-[10px] text-slate-600 lowercase leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border border-slate-800 p-6 bg-[#030303] flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <div className="font-mono text-[8px] text-slate-700 uppercase tracking-widest mb-1">
            // siguiente estado del sistema
          </div>
          <p className="font-mono text-sm text-white lowercase">
            accede al sandbox interactivo con los 6 agentes beta.
          </p>
        </div>
        <button
          onClick={onActivate}
          className="flex-shrink-0 bg-copper text-black font-mono text-[9px] uppercase tracking-widest px-8 py-3 hover:bg-amber-600 transition-colors"
        >
          activar núcleo simbiótico →
        </button>
      </div>
    </div>
  );
}
