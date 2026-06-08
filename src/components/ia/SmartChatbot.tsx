'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useHardware } from '@/context/HardwareContext';
import { SmartButton } from '@/components/ui/SmartButton';

interface Message {
  id: number;
  text: string;
  sender: 'ai' | 'user';
}

export function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '¡Hola! Soy el asistente de RZStudio. ¿En qué puedo ayudarte hoy?', sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { config } = useHardware();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      const data = await response.json();
      
      const aiMsg: Message = { 
        id: Date.now() + 1, 
        text: data.reply || 'Lo siento, he tenido un pequeño glitch neuronal. ¿Podrías repetir?', 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
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
            className={`
              mb-4 w-[340px] md:w-[380px] h-[480px] 
              rounded-none border border-slate-800 flex flex-col overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.85)]
              ${config.useBlur ? 'glass' : 'bg-[#050505]'}
            `}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-[#0c0806] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-slate-800 flex items-center justify-center text-copper">
                  <Bot size={16} strokeWidth={1} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs font-mono tracking-wider">rz_assistant_v4</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-copper rounded-none animate-pulse" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">system: optimal</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-6 h-6 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-copper transition-all duration-300"
              >
                <X size={12} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-3 rounded-none text-[11px] font-mono leading-relaxed border
                    ${msg.sender === 'user' 
                      ? 'bg-[#0c0806] border-copper/35 text-white' 
                      : 'bg-[#050505] border-slate-800 text-slate-300'}
                  `}>
                    {msg.sender === 'user' ? '> ' : ''}{msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#050505] border border-slate-800 p-2.5 rounded-none flex gap-1">
                    <span className="w-1 h-1 bg-copper rounded-none animate-bounce" />
                    <span className="w-1 h-1 bg-copper rounded-none animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-copper rounded-none animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-800 bg-[#0c0806]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="[preguntar_al_sistema...]"
                  className="flex-1 bg-[#050505] border border-slate-800 rounded-none px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-copper transition-all duration-300"
                />
                <button 
                  onClick={handleSend}
                  className="w-9 h-9 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-copper hover:shadow-[0_0_8px_rgba(201,115,82,0.3)] transition-all duration-300"
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
        className="w-12 h-12 bg-[#050505] border border-slate-800 flex items-center justify-center text-copper shadow-[0_0_8px_rgba(201,115,82,0.1)] hover:border-copper hover:shadow-[0_0_15px_rgba(201,115,82,0.5)] transition-all duration-300 rounded-none relative group"
      >
        {isOpen ? <X size={18} /> : <MessageSquare size={18} strokeWidth={1} />}
      </motion.button>
    </div>
  );
}
