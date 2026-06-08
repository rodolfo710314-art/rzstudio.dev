'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewSwitch } from './ViewSwitch';
import { InteligenciaView } from './InteligenciaView';
import { SandboxGrid } from './SandboxGrid';

export function SimbiosisShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showFlash, setShowFlash] = useState(false);

  const currentView = searchParams.get('view') ?? 'inteligencia';
  const isSimbiotico = currentView === 'simbiosis';

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
  }, []);

  function handleViewSwitch(view: 'inteligencia' | 'simbiosis') {
    if (view === currentView) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
    if (view === 'simbiosis') triggerFlash();
  }

  return (
    <div className="relative">
      {/* Console power-on flash */}
      {showFlash && (
        <div
          className="fixed inset-0 z-[9999] pointer-events-none animate-console-power-on"
          onAnimationEnd={() => setShowFlash(false)}
        />
      )}

      {/* View switch */}
      <div className="mb-10">
        <ViewSwitch currentView={currentView} onSwitch={handleViewSwitch} />
      </div>

      {/* Content with crossfade */}
      <AnimatePresence mode="wait">
        {!isSimbiotico ? (
          <motion.div
            key="inteligencia"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <InteligenciaView onActivate={() => handleViewSwitch('simbiosis')} />
          </motion.div>
        ) : (
          <motion.div
            key="simbiosis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-6">
              <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-1">
                // sandbox interactivo beta
              </span>
              <p className="font-mono text-xs text-slate-700 lowercase">
                6 proyectos de ia en ejecución. selecciona un proyecto para abrir el panel de diagnóstico.
              </p>
            </div>
            <SandboxGrid />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
