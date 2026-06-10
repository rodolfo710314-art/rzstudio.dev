'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useHardware } from '@/context/HardwareContext';

interface Message {
  id: number;
  text: string;
  sender: 'ai' | 'user';
}

// Shape sent to the API
interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Message = {
  id: 0,
  text: 'hola. soy el asistente de rzstudio. ¿en qué puedo ayudarte?',
  sender: 'ai',
};

export function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config } = useHardware();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens; Escape to close
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const text = input.trim();
    const userMsg: Message = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    // Build history for the API (exclude the welcome message)
    const history: HistoryEntry[] = messages
      .filter((m) => m.id !== 0)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'error de red');
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: data.reply, sender: 'ai' },
      ]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'error desconocido';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: '// error de conexión. intenta de nuevo.',
          sender: 'ai',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-mono text-xs lowercase">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            role="dialog"
            aria-modal="true"
            aria-label="asistente rzstudio"
            className={`mb-4 w-[340px] md:w-[380px] h-[480px] rounded-none border border-slate-800 flex flex-col overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.85)] ${config.useBlur ? 'glass' : 'bg-[#050505]'}`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-[#0c0806] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-slate-800 flex items-center justify-center text-copper" aria-hidden="true">
                  <Bot size={16} strokeWidth={1} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs font-mono tracking-wider">rz_assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-copper rounded-none animate-pulse" aria-hidden="true" />
                    <span className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">sistema: activo</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-copper transition-all duration-300"
                aria-label="cerrar asistente"
              >
                <X size={12} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505]"
              aria-live="polite"
              aria-label="conversación"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 text-[13px] font-mono leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-[#0c0806] border-copper/35 text-white'
                      : error && msg === messages[messages.length - 1] && msg.sender === 'ai'
                      ? 'bg-[#050505] border-red-900/40 text-red-400/70'
                      : 'bg-[#050505] border-slate-800 text-slate-300'
                  }`}>
                    {msg.sender === 'user' ? '> ' : ''}{msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start" aria-label="escribiendo">
                  <div className="bg-[#050505] border border-slate-800 p-2.5 flex gap-1" aria-hidden="true">
                    <span className="w-1 h-1 bg-copper rounded-none animate-bounce" />
                    <span className="w-1 h-1 bg-copper rounded-none animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-copper rounded-none animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800 bg-[#0c0806] flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isTyping}
                  maxLength={2000}
                  placeholder="[preguntar_al_sistema...]"
                  aria-label="mensaje"
                  className="flex-1 bg-[#050505] border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-copper transition-all duration-300 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="w-9 h-9 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-copper hover:shadow-[0_0_8px_rgba(201,115,82,0.3)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="enviar mensaje"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Toggle */}
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'cerrar asistente' : 'abrir asistente'}
        aria-expanded={isOpen}
        className="w-12 h-12 bg-[#050505] border border-slate-800 flex items-center justify-center text-copper shadow-[0_0_8px_rgba(201,115,82,0.1)] hover:border-copper hover:shadow-[0_0_15px_rgba(201,115,82,0.5)] transition-all duration-300 rounded-none"
      >
        {isOpen ? <X size={18} /> : <MessageSquare size={18} strokeWidth={1} />}
      </motion.button>
    </div>
  );
}
