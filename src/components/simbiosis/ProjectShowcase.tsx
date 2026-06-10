'use client';

// ProjectShowcase (doc Bloque 3) — pantalla de información por proyecto.
// Se muestra ANTES del sandbox o la descarga. Los datos vienen del campo
// "showcase" del .rz-manifest.json servido por /api/showcase/[projectId].

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Cpu, Shield, GitBranch, Search, GitPullRequest, TrendingDown, Activity, AlertTriangle, Smartphone, Layers, Package, Zap, Database, Gauge, FileText, Network, ShieldCheck, RotateCcw, Brain, LayoutGrid, Eye } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Project } from './data';

const ICONS: Record<string, LucideIcon> = {
  Cpu, Shield, GitBranch, Search, GitPullRequest, TrendingDown, Activity,
  AlertTriangle, Smartphone, Layers, Package, Zap, Database, Gauge, FileText,
  Network, ShieldCheck, RotateCcw, Brain, LayoutGrid, Eye,
};

interface ShowcaseData {
  name:        string;
  tagline:     string;
  description: string;
  type:        'web' | 'android' | 'both';
  features:    { icon: string; title: string; detail: string }[];
  benefits:    string[];
  how_to_use:  { step: number; title: string; description: string }[];
}

interface ProjectShowcaseProps {
  project:   Project | null;
  onClose:   () => void;
  onSandbox: (project: Project) => void;
  onAndroid: (project: Project) => void;
}

export function ProjectShowcase({ project, onClose, onSandbox, onAndroid }: ProjectShowcaseProps) {
  const [data, setData]       = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!project) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    setData(null);
    setTimeout(() => closeRef.current?.focus(), 60);

    fetch(`/api/showcase/${project.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [project?.id]);

  const showWeb     = project && (project.platform === 'web' || project.platform === 'both');
  const showAndroid = project && (project.platform === 'android' || project.platform === 'both');

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            key="sc-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[150]"
            aria-hidden="true"
          />

          <motion.div
            key="sc-modal"
            role="dialog" aria-modal="true"
            aria-label={`expediente del proyecto: ${project.name}`}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[151]
                       w-[calc(100%-2rem)] max-w-4xl max-h-[88vh] bg-zinc-950 border border-slate-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-800/60 flex-shrink-0">
              <div>
                <span className="font-mono text-[8px] text-copper uppercase tracking-widest block mb-0.5" aria-hidden="true">
                  // expediente del proyecto [{project.id}]
                </span>
                <h3 className="font-mono text-base text-white lowercase leading-tight">{project.name}</h3>
                {data && (
                  <p className="font-mono text-[11px] text-copper/80 lowercase mt-1">{data.tagline}</p>
                )}
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                className="text-slate-700 hover:text-slate-300 transition-colors mt-0.5"
                aria-label="cerrar expediente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-6 font-mono text-xs text-slate-600 lowercase animate-pulse">
                  {'>'} cargando manifiesto del proyecto...
                </p>
              ) : !data ? (
                <p className="p-6 font-mono text-xs text-slate-600 lowercase">
                  {'>'} este proyecto aún no tiene manifiesto público.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-slate-800/60">
                  {/* Izquierda: descripción + beneficios */}
                  <div className="p-6 space-y-6">
                    <div>
                      <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-2">
                        // qué es
                      </span>
                      <p className="font-mono text-[11px] text-slate-400 lowercase leading-relaxed">
                        {data.description}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-3">
                        // beneficios
                      </span>
                      <div className="space-y-2">
                        {data.benefits.map((b, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <Check className="w-3 h-3 text-emerald-500/80 mt-0.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                            <span className="font-mono text-[10px] text-slate-500 lowercase leading-relaxed">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Derecha: features + cómo usarlo */}
                  <div className="p-6 space-y-6 border-t md:border-t-0 border-slate-800/60">
                    <div>
                      <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-3">
                        // capacidades
                      </span>
                      <div className="space-y-3">
                        {data.features.map((f, i) => {
                          const Icon = ICONS[f.icon] ?? Cpu;
                          return (
                            <div key={i} className="flex items-start gap-3 border border-slate-800/60 p-3 bg-black/20">
                              <Icon className="w-3.5 h-3.5 text-copper mt-0.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                              <div>
                                <div className="font-mono text-[10px] text-white lowercase">{f.title}</div>
                                <div className="font-mono text-[9px] text-slate-600 lowercase leading-relaxed">{f.detail}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-3">
                        // cómo probarlo
                      </span>
                      <div className="space-y-2.5">
                        {data.how_to_use.map((s) => (
                          <div key={s.step} className="flex items-start gap-3">
                            <span className="font-mono text-[9px] text-copper border border-slate-800 w-5 h-5 flex items-center justify-center shrink-0">
                              {s.step}
                            </span>
                            <div>
                              <div className="font-mono text-[10px] text-slate-300 lowercase">{s.title}</div>
                              <div className="font-mono text-[9px] text-slate-600 lowercase leading-relaxed">{s.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botonera contextual */}
            <div className="border-t border-slate-800 px-6 py-4 flex gap-2 flex-shrink-0">
              {showWeb && (
                <button
                  onClick={() => onSandbox(project)}
                  className="flex-1 font-mono text-[9px] uppercase tracking-widest border border-slate-700 text-slate-300 py-2.5
                             hover:border-copper hover:text-copper transition-colors"
                >
                  iniciar entorno de prueba
                </button>
              )}
              {showAndroid && (
                <button
                  onClick={() => onAndroid(project)}
                  className="flex-1 font-mono text-[9px] uppercase tracking-widest border border-emerald-900 text-emerald-500 py-2.5
                             hover:bg-emerald-950/40 transition-colors"
                >
                  obtener binario seguro
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
