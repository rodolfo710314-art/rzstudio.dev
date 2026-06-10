'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Cpu, Hash } from 'lucide-react';
import { Project } from './data';
import { DiffBlock } from './DiffBlock';
import { TriggerConfirmModal } from './TriggerConfirmModal';

interface DiagnosticDrawerProps {
  project: Project | null;
  onClose: () => void;
  onMerge: (project: Project) => void;
  onPurge: (project: Project) => void;
  onDebate: (project: Project) => void;
}

type Resolution = 'merged' | 'purged' | 'vetoed' | 'error' | null;

// Skip log animation on re-open of a project already seen
const seenLogs = new Set<string>();

export function DiagnosticDrawer({
  project,
  onClose,
  onMerge,
  onPurge,
  onDebate,
}: DiagnosticDrawerProps) {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [resolution, setResolution] = useState<Resolution>(null);
  const [resolutionDetail, setResolutionDetail] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'merge' | 'purge' | null>(null);
  const [executing, setExecuting] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape key handler
  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [project?.id]);

  // Focus close button on open
  useEffect(() => {
    if (project) setTimeout(() => closeButtonRef.current?.focus(), 50);
  }, [project?.id]);

  // Log animation — skip if project was already opened before
  useEffect(() => {
    if (!project) {
      setVisibleLogs([]);
      setResolution(null);
      return;
    }
    setResolution(null);

    setResolutionDetail(null);
    if (seenLogs.has(project.id)) {
      setVisibleLogs(project.auditLogs);
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
        seenLogs.add(project.id);
      }
    }, 650);
    return () => clearInterval(interval);
  }, [project?.id]);

  // Veredicto humano real (doc §9.3): pasa por el backend — el merge
  // atraviesa el Juez de Hierro y todo queda documentado en un acta.
  async function executeVerdict(p: Project, action: 'merge' | 'purge') {
    setConfirming(null);
    setExecuting(true);
    setResolutionDetail(null);

    try {
      const res = await fetch('/api/admin/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: p.id, action }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setResolution('error');
        setResolutionDetail(data.error ?? 'requiere sesión de administrador');
        return;
      }
      if (res.status === 409 && data.vetoed) {
        setResolution('vetoed');
        setResolutionDetail((data.reasons as string[])?.join(' · ') ?? 'vetado por el juez de hierro');
        return;
      }
      if (!res.ok) {
        setResolution('error');
        setResolutionDetail(data.error ?? `el servidor respondió ${res.status}`);
        return;
      }

      if (action === 'merge') {
        setResolution('merged');
        setResolutionDetail(data.github ?? null);
        setTimeout(() => onMerge(p), 1800);
      } else {
        setResolution('purged');
        setResolutionDetail(data.github ?? null);
        setTimeout(() => onPurge(p), 1800);
      }
    } catch {
      setResolution('error');
      setResolutionDetail('sin conexión con el núcleo');
    } finally {
      setExecuting(false);
    }
  }

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
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`panel de diagnóstico: ${project.name}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-950 border-l border-slate-800 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="font-mono text-[8px] text-copper uppercase tracking-widest block" aria-hidden="true">
                  // panel de diagnóstico
                </span>
                <h2 className="font-mono text-sm text-white lowercase mt-0.5">
                  {project.name}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
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
                  <Icon className="w-3 h-3 text-copper flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
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
              {/* Terminal log */}
              <div>
                <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-2" aria-hidden="true">
                  // flujo de conciencia ia
                </span>
                <div className="bg-black border border-slate-800 p-3 min-h-[110px] space-y-1.5" aria-live="polite">
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
                    <span className="font-mono text-[10px] text-slate-800 animate-pulse" aria-hidden="true">
                      {'> _'}
                    </span>
                  )}
                </div>
              </div>

              {/* Micro-diff */}
              <div>
                <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-2" aria-hidden="true">
                  // micro-diff propuesto
                </span>
                <DiffBlock codeDiff={project.codeDiff} />
              </div>
            </div>

            {/* Resolution feedback */}
            <AnimatePresence>
              {resolution && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="status"
                  className={`mx-5 mb-3 px-4 py-2.5 font-mono text-[9px] border ${
                    resolution === 'merged'
                      ? 'border-emerald-900 text-emerald-400/80 bg-emerald-950/20'
                      : resolution === 'vetoed'
                      ? 'border-amber-900/50 text-amber-400/80 bg-amber-950/10'
                      : 'border-red-900/40 text-red-400/70 bg-red-950/10'
                  }`}
                >
                  {resolution === 'merged'   && '✓ merge ejecutado. acta de simbiosis generada.'}
                  {resolution === 'purged'   && '✗ entorno purgado. acta de simbiosis generada.'}
                  {resolution === 'vetoed'   && '⊘ vetado por el juez de hierro.'}
                  {resolution === 'error'    && '✗ acción no ejecutada.'}
                  {resolutionDetail && (
                    <span className="block mt-1 text-slate-500 lowercase">{resolutionDetail}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="border-t border-slate-800 px-5 py-4 flex gap-2 flex-shrink-0">
              <button
                onClick={() => setConfirming('merge')}
                disabled={resolution === 'merged' || resolution === 'purged' || executing}
                className="flex-1 bg-copper text-black font-mono text-[8px] uppercase tracking-widest py-2.5 hover:bg-amber-600 transition-colors disabled:opacity-40"
              >
                {executing ? 'ejecutando...' : 'ejecutar merge'}
              </button>
              <button
                onClick={() => onDebate(project)}
                disabled={resolution === 'merged' || resolution === 'purged' || executing}
                className="flex-1 border border-slate-700 text-slate-400 font-mono text-[8px] uppercase tracking-widest py-2.5 hover:border-slate-500 hover:text-slate-200 transition-colors disabled:opacity-40"
              >
                rebatir solución
              </button>
              <button
                onClick={() => setConfirming('purge')}
                disabled={resolution === 'merged' || resolution === 'purged' || executing}
                className="font-mono text-[8px] uppercase tracking-wider text-red-900/50 hover:text-red-500/60 px-4 border border-transparent hover:border-red-900/20 transition-colors disabled:opacity-40"
              >
                purgar
              </button>
            </div>

            {/* Confirmación con countdown (segunda validación, doc Bloque 5) */}
            <TriggerConfirmModal
              open={confirming !== null}
              action={confirming ?? 'merge'}
              projectName={project.name}
              onConfirm={() => confirming && executeVerdict(project, confirming)}
              onCancel={() => setConfirming(null)}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
