'use client';

import { useEffect, useRef, useState } from 'react';
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

interface ParsedStat {
  num: number;
  suffix: string;
  spanishThousands: boolean;
}

function parseStatValue(value: string): ParsedStat | null {
  if (value.startsWith('<')) return null;
  // Matches: optional digits, optional dot+3digits, optional %
  const match = value.match(/^(\d+(?:\.\d{3})?)(%?)$/);
  if (!match) return null;
  const rawStr = match[1].replace(/\./g, ''); // strip thousands separator
  return {
    num: parseInt(rawStr, 10),
    suffix: match[2],
    spanishThousands: match[1].includes('.'),
  };
}

function AnimatedStat({ value, delay }: { value: string; delay: number }) {
  const parsed = parseStatValue(value);
  const [display, setDisplay] = useState(parsed ? `0${parsed.suffix}` : value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!parsed) {
      const t = setTimeout(() => setDisplay(value), delay);
      return () => clearTimeout(t);
    }

    const { num, suffix, spanishThousands } = parsed;
    const duration = 1200;
    let startTime = 0;

    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // easeOutCubic
      const current = Math.round(num * eased);
      const formatted =
        spanishThousands && current >= 1000
          ? current.toLocaleString('es-ES') // produces '4.291' for 4291
          : String(current);
      setDisplay(`${formatted}${suffix}`);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // intentional: run once on mount

  return <>{display}</>;
}

export function InteligenciaView({ onActivate }: InteligenciaViewProps) {
  return (
    <div className="space-y-14">
      {/* Intro */}
      <div className="max-w-2xl">
        <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-3" aria-hidden="true">
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
            <div className="font-mono text-2xl font-bold text-white tabular-nums">
              <AnimatedStat value={value} delay={i * 80 + 300} />
            </div>
            <div className="font-mono text-[8px] text-slate-700 uppercase tracking-wider mt-0.5">{unit}</div>
            <div className="w-4 h-[1px] bg-copper mt-2.5 mb-1.5" aria-hidden="true" />
            <div className="font-mono text-[10px] text-slate-600 lowercase">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Capabilities */}
      <div>
        <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-6" aria-hidden="true">
          // capacidades del núcleo
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CAPABILITIES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="border border-slate-800 p-4 flex gap-4 bg-black/20">
              <div className="w-8 h-8 border border-slate-800 flex items-center justify-center text-copper flex-shrink-0" aria-hidden="true">
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
          <div className="font-mono text-[8px] text-slate-700 uppercase tracking-widest mb-1" aria-hidden="true">
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
