'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Project } from './data';

interface AndroidModalProps {
  project: Project | null;
  onClose: () => void;
}

export function AndroidModal({ project, onClose }: AndroidModalProps) {
  const [form, setForm] = useState({ name: '', email: '', company: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  // Reset form when modal closes
  function handleClose() {
    setForm({ name: '', email: '', company: '' });
    setSubmitted(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md bg-zinc-950 border border-slate-800 p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="font-mono text-[8px] text-copper uppercase tracking-widest block mb-0.5">
                  // obtener binario seguro
                </span>
                <h3 className="font-mono text-sm text-white lowercase leading-tight">
                  {project.name}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-700 hover:text-slate-300 transition-colors mt-0.5"
                aria-label="cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(['name', 'email', 'company'] as const).map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="font-mono text-[8px] text-slate-600 uppercase tracking-wider block">
                      {field === 'name' ? 'nombre_' : field === 'email' ? 'email_' : 'empresa_ (opcional)'}
                    </label>
                    <input
                      required={field !== 'company'}
                      type={field === 'email' ? 'email' : 'text'}
                      value={form[field]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field]: e.target.value }))
                      }
                      placeholder={
                        field === 'name' ? 'tu nombre' : field === 'email' ? 'tu@email.com' : 'opcional'
                      }
                      className="w-full bg-black border border-slate-800 px-3 py-2 font-mono text-xs text-white placeholder-slate-800 focus:outline-none focus:border-copper transition-colors"
                    />
                  </div>
                ))}

                <div className="font-mono text-[8px] text-slate-700 border border-slate-800/50 p-2.5 bg-black/30 leading-relaxed">
                  <span className="text-amber-600/50">// aviso de seguridad —</span>{' '}
                  binario firmado con clave rz-studio-2026. verifica la firma antes de instalar.
                  compatible con android 11+.
                </div>

                <button
                  type="submit"
                  className="w-full bg-copper text-black font-mono text-[9px] uppercase tracking-widest py-2.5 hover:bg-amber-600 transition-colors"
                >
                  solicitar acceso beta
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="w-1.5 h-1.5 bg-emerald-500 mx-auto mb-4" />
                <p className="font-mono text-xs text-emerald-400 lowercase">
                  solicitud registrada.
                </p>
                <p className="font-mono text-[10px] text-slate-600 mt-2 leading-relaxed">
                  recibirás el binario firmado en tu email en las próximas 24h.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
