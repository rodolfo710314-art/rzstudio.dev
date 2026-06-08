'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Cpu, Hash } from 'lucide-react';
import { Project } from './data';

interface DiagnosticDrawerProps {
  project: Project | null;
  onClose: () => void;
  onMerge: (project: Project) => void;
  onPurge: (project: Project) => void;
  onDebate: (project: Project) => void;
}

export function DiagnosticDrawer({
  project,
  onClose,
  onMerge,
  onPurge,
  onDebate,
}: DiagnosticDrawerProps) {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!project) {
      setVisibleLogs([]);
      return;
    }
    setVisibleLogs([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < project.auditLogs.length) {
        setVisibleLogs((prev) => [...prev, project.auditLogs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 650);
    return () => clearInterval(interval);
  }, [project?.id]);

  const METRICS = project
    ? [
        { icon: Zap, label: 'latencia', value: project.latency },
        { icon: Hash, label: 'tokens', value: project.tokens },
        { icon: Cpu, label: 'agente', value: project.agent },
      ]
    : [];

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-950 border-l border-slate-800 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="font-mono text-[8px] text-copper uppercase tracking-widest block">
                  // panel de diagnóstico
                </span>
                <h2 className="font-mono text-sm text-white lowercase mt-0.5">
                  {project.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-slate-700 hover:text-slate-300 transition-colors"
                aria-label="cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics bar */}
            <div className="border-b border-slate-800 px-5 py-3 flex gap-7 flex-shrink-0 bg-black/20">
              {METRICS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-3 h-3 text-copper flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="font-mono text-[7px] text-slate-700 uppercase tracking-wider">
                      {label}
                    </div>
                    <div className="font-mono text-[11px] text-white">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Terminal log — flujo de conciencia */}
              <div>
                <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-2">
                  // flujo de conciencia ia
                </span>
                <div className="bg-black border border-slate-800 p-3 min-h-[110px] space-y-1.5">
                  {visibleLogs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`font-mono text-[10px] ${
                        log.includes('[WARN]') || log.includes('[ALERT]')
                          ? 'text-amber-500/80'
                          : log.includes('[INIT]') || log.includes('[PERF]')
                          ? 'text-emerald-500/70'
                          : 'text-slate-500'
                      }`}
                    >
                      {log}
                    </motion.div>
                  ))}
                  {visibleLogs.length < project.auditLogs.length && (
                    <span className="font-mono text-[10px] text-slate-800 animate-pulse">
                      {'> _'}
                    </span>
                  )}
                </div>
              </div>

              {/* Micro-diff */}
              <div>
                <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-2">
                  // micro-diff propuesto
                </span>
                <div className="bg-black border border-slate-800 p-3 overflow-x-auto">
                  {project.codeDiff.old.map((line, i) => (
                    <div
                      key={`old-${i}`}
                      className="font-mono text-[9px] text-red-400/60 whitespace-pre leading-5"
                    >
                      {`- ${line}`}
                    </div>
                  ))}
                  <div className="h-1.5" />
                  {project.codeDiff.new.map((line, i) => (
                    <div
                      key={`new-${i}`}
                      className="font-mono text-[9px] text-emerald-400/70 whitespace-pre leading-5"
                    >
                      {`+ ${line}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-slate-800 px-5 py-4 flex gap-2 flex-shrink-0">
              <button
                onClick={() => onMerge(project)}
                className="flex-1 bg-copper text-black font-mono text-[8px] uppercase tracking-widest py-2.5 hover:bg-amber-600 transition-colors"
              >
                ejecutar merge
              </button>
              <button
                onClick={() => onDebate(project)}
                className="flex-1 border border-slate-700 text-slate-400 font-mono text-[8px] uppercase tracking-widest py-2.5 hover:border-slate-500 hover:text-slate-200 transition-colors"
              >
                rebatir solución
              </button>
              <button
                onClick={() => onPurge(project)}
                className="font-mono text-[8px] uppercase tracking-wider text-red-900/50 hover:text-red-500/60 px-4 border border-transparent hover:border-red-900/20 transition-colors"
              >
                purgar
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
