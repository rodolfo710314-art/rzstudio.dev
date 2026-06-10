'use client';

// War Room real (doc §10): chat dialéctico con el Agente Ingeniero (Claude Sonnet 4.6).
// Requiere sesión de administrador — las llaves de ejecución las valida el SERVIDOR:
//   "va que va" → juez de hierro → merge | "darle cuello" / "abortar misión" → purga.

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, GitBranch, Activity } from 'lucide-react';
import { Project } from './data';
import { DiffBlock } from './DiffBlock';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tone?: 'approve' | 'reject' | 'neutral';
}

interface WarRoomProps {
  project: Project;
  onClose: () => void;
  onMerge: () => void;
  onPurge: () => void;
}

export function WarRoom({ project, onClose, onMerge, onPurge }: WarRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      tone: 'neutral',
      content: `> sala dialéctica activada para [${project.name}].\n> agente ingeniero conectado — contexto inyectado desde el manifiesto del proyecto.\n> llaves de ejecución: "va que va" (merge) · "darle cuello" / "abortar misión" (purga).\n> comandos genéricos (sí, ok, procede) NO disparan acciones.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resolution, setResolution] = useState<'approved' | 'rejected' | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !resolution) onCloseRef.current();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [resolution]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, processing]);

  async function handleSend() {
    const content = input.trim();
    if (!content || processing || resolution) return;
    setInput('');

    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setProcessing(true);

    try {
      const res = await fetch('/api/war-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          messages: next
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, {
          role: 'system', tone: 'reject',
          content: `> [ERROR] ${data.error ?? `el servidor respondió ${res.status}`}`,
        }]);
        return;
      }

      // Acciones del backend (llaves de ejecución detectadas server-side)
      if (data.action === 'merged' || data.action === 'purged' || data.action === 'vetoed') {
        setShowFlash(true); // destello de confirmación (doc §10.3)
        const tone = data.action === 'merged' ? 'approve' : 'reject';
        setMessages((prev) => [...prev, {
          role: 'system', tone,
          content: (data.log as string[]).join('\n'),
        }]);

        if (data.action === 'merged') {
          setResolution('approved');
          setTimeout(onMerge, 1600);
        } else if (data.action === 'purged') {
          setResolution('rejected');
          setTimeout(onPurge, 1600);
        }
        // veto: la sesión queda abierta para revisar el conflicto — no se cierra sola
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? '…' }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'system', tone: 'reject',
        content: '> [ERROR] sin conexión con el núcleo. reintenta.',
      }]);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] bg-[#020202] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="sala dialéctica"
    >
      {/* Destello de confirmación de acción */}
      {showFlash && (
        <div
          className="fixed inset-0 z-[400] pointer-events-none animate-console-power-on"
          onAnimationEnd={() => setShowFlash(false)}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-5">
          <span className="font-mono text-[8px] text-red-500/70 uppercase tracking-widest animate-pulse">
            ● sala dialéctica activa
          </span>
          <span className="font-mono text-[8px] text-slate-700 uppercase tracking-wider hidden sm:block" aria-hidden="true">
            // {project.name} // agente: {project.agent}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-700 hover:text-slate-400 transition-colors"
          aria-label="cerrar sala dialéctica"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Izquierda — evidencia */}
        <div className="md:w-1/2 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-hidden max-h-[38vh] md:max-h-none">
          <div className="border-b border-slate-800 px-4 py-2 flex-shrink-0">
            <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest" aria-hidden="true">
              // referencias y evidencia
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="border border-slate-800 p-3 bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3 h-3 text-copper" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-mono text-[8px] text-copper uppercase tracking-wider">
                  descripción del proyecto
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-500 lowercase leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="border border-slate-800 p-3 bg-black/20">
              <div className="flex items-center gap-2 mb-2.5">
                <Activity className="w-3 h-3 text-copper" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-mono text-[8px] text-copper uppercase tracking-wider">
                  métricas de sesión
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'latencia', value: project.latency },
                  { label: 'tokens', value: project.tokens },
                  { label: 'agente', value: project.agent },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="font-mono text-[7px] text-slate-700 uppercase tracking-wider">{label}</div>
                    <div className="font-mono text-[11px] text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-800 p-3 bg-black/20">
              <div className="flex items-center gap-2 mb-2.5">
                <GitBranch className="w-3 h-3 text-copper" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-mono text-[8px] text-copper uppercase tracking-wider">
                  diff propuesto
                </span>
              </div>
              <DiffBlock codeDiff={project.codeDiff} />
            </div>

            <div className="border border-slate-800 p-3 bg-black/20">
              <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest block mb-2" aria-hidden="true">
                // log de auditoría
              </span>
              <div className="space-y-1">
                {project.auditLogs.map((log, i) => (
                  <div key={i} className="font-mono text-[9px] text-slate-600">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Derecha — chat real */}
        <div className="flex-1 md:w-1/2 flex flex-col min-h-0">
          <div className="border-b border-slate-800 px-4 py-2 flex-shrink-0">
            <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest" aria-hidden="true">
              // interfaz dialéctica // claude sonnet 4.6 en vivo
            </span>
          </div>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            aria-live="polite"
            aria-label="conversación"
          >
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                {msg.role === 'user' ? (
                  <div className="inline-block text-left max-w-[80%]">
                    <div className="font-mono text-[7px] text-copper/50 mb-0.5 text-right" aria-hidden="true">// tú</div>
                    <div className="font-mono text-[11px] text-white border border-slate-800 px-3 py-2 bg-black/40">
                      {msg.content}
                    </div>
                  </div>
                ) : msg.role === 'assistant' ? (
                  <div className="max-w-[92%]">
                    <div className="font-mono text-[7px] text-slate-700 mb-0.5" aria-hidden="true">// agente ingeniero</div>
                    <div className="font-mono text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap border-l border-slate-800 pl-3">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`font-mono text-[10px] leading-relaxed whitespace-pre-line ${
                      msg.tone === 'approve' ? 'text-emerald-400/80'
                      : msg.tone === 'reject' ? 'text-red-400/70'
                      : 'text-slate-500'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {processing && (
              <div className="font-mono text-[10px] text-slate-700" aria-hidden="true">
                {'> '}
                <span className="animate-pulse">el agente está razonando...</span>
              </div>
            )}

            {resolution && (
              <div
                role="status"
                className={`font-mono text-[10px] border p-3 leading-relaxed ${
                  resolution === 'approved'
                    ? 'border-emerald-900 text-emerald-400/80 bg-emerald-950/10'
                    : 'border-red-900/40 text-red-400/70 bg-red-950/10'
                }`}
              >
                {resolution === 'approved'
                  ? '✓ veredicto ejecutado. acta de simbiosis generada. sesión cerrada.'
                  : '✗ entorno purgado. acta de simbiosis generada. sesión cerrada.'}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-800 p-4 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={processing || !!resolution}
                placeholder="debate la solución con el agente — solo las llaves exactas ejecutan acciones"
                aria-label="mensaje"
                className="flex-1 bg-black border border-slate-800 px-3 py-2 font-mono text-[11px] text-white placeholder-slate-800 focus:outline-none focus:border-slate-700 disabled:opacity-40 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={processing || !!resolution || !input.trim()}
                className="font-mono text-[8px] uppercase tracking-wider px-4 border border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
              >
                env_
              </button>
            </div>
            <p className="font-mono text-[7px] text-slate-800 mt-2" aria-hidden="true">
              requiere sesión de administrador. el merge pasa primero por el juez de hierro.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
