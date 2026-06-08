'use client';

import React, { useState } from 'react';
import { SmartCard } from "@/components/ui/SmartCard";
import { SmartButton } from "@/components/ui/SmartButton";
import { Mail, Phone, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function ContactContent() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-20 font-mono text-xs lowercase">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 border border-copper text-copper flex items-center justify-center mx-auto mb-6 rounded-none">
            <CheckCircle2 size={32} strokeWidth={1} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white mb-4 font-sans">[mensaje enviado]</h1>
          <p className="text-slate-500 mb-8 font-mono">la cola de procesamiento responderá en menos de 24 horas.</p>
          <SmartButton onClick={() => setSubmitted(false)} variant="outline">
            enviar otro mensaje_
          </SmartButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 font-mono text-xs lowercase">
      <div>
        <div className="font-mono text-[9px] text-slate-500 mb-4 tracking-widest uppercase">// connection_handshake_v1</div>
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-8 font-sans">
          ¿listo para <span className="text-copper">evolucionar_</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 mb-12 font-sans font-light max-w-md">expertos en ia listos para tu próximo gran desafío de ingeniería.</p>
        
        <div className="space-y-8 font-mono">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 border border-slate-800 bg-[#020202] flex items-center justify-center text-copper rounded-none">
              <Mail size={16} strokeWidth={1} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] tracking-widest font-bold uppercase">// email</p>
              <p className="text-white font-medium">hola@rzstudio.com</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 border border-slate-800 bg-[#020202] flex items-center justify-center text-copper rounded-none">
              <Phone size={16} strokeWidth={1} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] tracking-widest font-bold uppercase">// teléfono</p>
              <p className="text-white font-medium">+1 (555) 000-0000</p>
            </div>
          </div>
        </div>
      </div>

      <SmartCard title="envíanos un mensaje" className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <label htmlFor="name" className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">// nombre</label>
            <input 
              id="name"
              required 
              type="text" 
              className="w-full bg-[#050505] border border-slate-800 rounded-none px-4 py-3 text-white placeholder-slate-600 focus:border-copper outline-none transition-all duration-300 font-mono text-xs" 
              placeholder="[tu nombre]" 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">// email</label>
            <input 
              id="email"
              required 
              type="email" 
              className="w-full bg-[#050505] border border-slate-800 rounded-none px-4 py-3 text-white placeholder-slate-600 focus:border-copper outline-none transition-all duration-300 font-mono text-xs" 
              placeholder="[tu@email.com]" 
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">// mensaje</label>
            <textarea 
              id="message"
              required 
              rows={4} 
              className="w-full bg-[#050505] border border-slate-800 rounded-none px-4 py-3 text-white resize-none placeholder-slate-600 focus:border-copper outline-none transition-all duration-300 font-mono text-xs" 
              placeholder="[cuéntanos sobre tu proyecto...]" 
            />
          </div>
          <SmartButton type="submit" className="w-full py-3.5">
            enviar mensaje <Send className="ml-2 w-3.5 h-3.5" strokeWidth={1} />
          </SmartButton>
        </form>
      </SmartCard>
    </div>
  );
}
