'use client';

// Modal de confirmación con countdown de 5s (doc Bloque 5) — segunda validación
// antes de las acciones irreversibles del pipeline (merge / purga).

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TriggerConfirmModalProps {
  open:      boolean;
  action:    'merge' | 'purge';
  projectName: string;
  onConfirm: () => void;
  onCancel:  () => void;
}

const COUNTDOWN_SECONDS = 5;

export function TriggerConfirmModal({ open, action, projectName, onConfirm, onCancel }: TriggerConfirmModalProps) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!open) return;
    setRemaining(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const isMerge = action === 'merge';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[350]"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={`confirmar ${isMerge ? 'merge' : 'purga'}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[351]
                       w-full max-w-sm bg-zinc-950 border border-slate-800 p-6"
          >
            <span className={`font-mono text-[8px] uppercase tracking-widest block mb-1 ${isMerge ? 'text-copper' : 'text-red-500/70'}`}>
              // confirmación de {isMerge ? 'merge a producción' : 'purga de entorno'}
            </span>
            <p className="font-mono text-xs text-white lowercase mb-1">{projectName}</p>
            <p className="font-mono text-[10px] text-slate-600 lowercase leading-relaxed mb-5">
              {isMerge
                ? 'el código pasará por el juez de hierro y, si aprueba, se fusionará a la rama principal. esta acción queda en acta.'
                : 'la rama temporal será destruida y los cambios descartados de forma permanente. esta acción queda en acta.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={onConfirm}
                disabled={remaining > 0}
                className={`flex-1 font-mono text-[9px] uppercase tracking-widest py-2.5 transition-colors disabled:cursor-not-allowed
                  ${isMerge
                    ? 'bg-copper text-black hover:bg-amber-600 disabled:opacity-40'
                    : 'border border-red-900/50 text-red-400 hover:bg-red-950/30 disabled:opacity-40'}`}
              >
                {remaining > 0 ? `confirmar en ${remaining}s...` : `confirmar ${isMerge ? 'merge' : 'purga'}`}
              </button>
              <button
                onClick={onCancel}
                className="font-mono text-[9px] uppercase tracking-widest text-slate-600 hover:text-slate-300 px-3 transition-colors"
              >
                cancelar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
