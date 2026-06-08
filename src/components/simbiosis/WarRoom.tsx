'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, GitBranch, Activity } from 'lucide-react';
import { Project } from './data';
import { detectIntent, SYSTEM_RESPONSES, QUICK_SUGGESTIONS } from '@/utils/intent';
import type { Intent } from '@/utils/intent';
import { DiffBlock } from './DiffBlock';

interface ChatMessage {
  role: 'user' | 'system';
  content: string;
  intent?: Intent;
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
      content: `> sala dialéctica activada para [${project.name}].\n> modo: debate de solución propuesta.\n> el flujo de aprobación es por detección de intención natural — sin botones de confirmación.\n> debate la solución o confirma tu decisión.`,
      intent: 'neutral',
    },
  ]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resolution, setResolution] = useState<'approved' | 'rejected' | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Cleanup interval on unmount — fixes memory leak
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Escape key to close (unless resolved — WarRoom will auto-close after resolution)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !resolution) onCloseRef.current();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [resolution]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || processing || resolution) return;
    const intent = detectIntent(content);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content, intent }]);
    setProcessing(true);

    const responses = SYSTEM_RESPONSES[intent];
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < responses.length) {
        setMessages((prev) => [...prev, { role: 'system', content: responses[i], intent }]);
        i++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProcessing(false);
        if (intent === 'approve') setTimeout(() => { setResolution('approved'); onMerge(); }, 700);
        if (intent === 'reject') setTimeout(() => { setResolution('rejected'); onPurge(); }, 700);
      }
    }, 550);
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
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-5">
          <span className="font-mono text-[8px] text-red-500/70 uppercase tracking-widest animate-pulse">
            ● sala dialéctica activa
          </span>
          <span className="font-mono text-[8px] text-slate-700 uppercase tracking-wider hidden sm:block" aria-hidden="true">
            // {project.name}
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

      {/* Split layout — stacks vertically on mobile */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left — Documents & diff (capped height on mobile to leave room for chat) */}
        <div className="md:w-1/2 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-hidden max-h-[38vh] md:max-h-none">
          <div className="border-b border-slate-800 px-4 py-2 flex-shrink-0">
            <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest" aria-hidden="true">
              // referencias y evidencia
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
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

            {/* Metrics */}
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

            {/* Diff */}
            <div className="border border-slate-800 p-3 bg-black/20">
              <div className="flex items-center gap-2 mb-2.5">
                <GitBranch className="w-3 h-3 text-copper" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-mono text-[8px] text-copper uppercase tracking-wider">
                  diff propuesto
                </span>
              </div>
              <DiffBlock codeDiff={project.codeDiff} />
            </div>

            {/* Audit log */}
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

        {/* Right — Conversational chat */}
        <div className="flex-1 md:w-1/2 flex flex-col min-h-0">
          <div className="border-b border-slate-800 px-4 py-2 flex-shrink-0">
            <span className="font-mono text-[8px] text-slate-700 uppercase tracking-widest" aria-hidden="true">
              // interfaz dialéctica // nlp activo
            </span>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            aria-live="polite"
            aria-label="conversación"
          >
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                {msg.role === 'system' ? (
                  <div
                    className={`font-mono text-[10px] leading-relaxed whitespace-pre-line ${
                      msg.intent === 'approve'
                        ? 'text-emerald-400/80'
                        : msg.intent === 'reject'
                        ? 'text-red-400/70'
                        : 'text-slate-500'
                    }`}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div className="inline-block text-left max-w-[80%]">
                    <div className="font-mono text-[7px] text-copper/50 mb-0.5 text-right" aria-hidden="true">// tú</div>
                    <div className="font-mono text-[11px] text-white border border-slate-800 px-3 py-2 bg-black/40">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {processing && (
              <div className="font-mono text-[10px] text-slate-700" aria-hidden="true">
                {'> '}
                <span className="animate-pulse">procesando intención natural...</span>
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
                  ? '✓ merge ejecutado exitosamente. sesión cerrada.'
                  : '✗ entorno purgado. estado restaurado a HEAD.'}
              </div>
            )}
          </div>

          {/* Quick suggestion chips */}
          {!processing && !resolution && (
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {QUICK_SUGGESTIONS.map(({ label, intent }) => (
                <button
                  key={label}
                  onClick={() => handleSend(label)}
                  className={`font-mono text-[7px] uppercase tracking-wider border px-2.5 py-1 transition-colors ${
                    intent === 'approve'
                      ? 'border-emerald-900/50 text-emerald-700 hover:border-emerald-700 hover:text-emerald-400'
                      : intent === 'reject'
                      ? 'border-red-900/30 text-red-900/60 hover:border-red-800/40 hover:text-red-500/60'
                      : 'border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-800 p-4 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={processing || !!resolution}
                placeholder='debate la solución o escribe "apruebo" / "rechazo"...'
                aria-label="mensaje"
                className="flex-1 bg-black border border-slate-800 px-3 py-2 font-mono text-[11px] text-white placeholder-slate-800 focus:outline-none focus:border-slate-700 disabled:opacity-40 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={processing || !!resolution || !input.trim()}
                className="font-mono text-[8px] uppercase tracking-wider px-4 border border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
              >
                env_
              </button>
            </div>
            <p className="font-mono text-[7px] text-slate-800 mt-2" aria-hidden="true">
              el sistema detecta tu intención de forma natural. no existen botones de confirmación.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
