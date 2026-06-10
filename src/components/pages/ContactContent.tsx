'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SmartCard } from "@/components/ui/SmartCard";
import { SmartButton } from "@/components/ui/SmartButton";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_EMAIL = "rodolfog@rzstudio.dev";

export function ContactContent() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consent }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `el servidor respondió ${res.status}`);
        return;
      }
      setSubmitted(true);
      setForm({ nombre: '', email: '', mensaje: '' });
      setConsent(false);
    } catch {
      setError('sin conexión — intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-20 font-mono text-xs lowercase">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 border border-copper text-copper flex items-center justify-center mx-auto mb-6 rounded-none">
            <CheckCircle2 size={32} strokeWidth={1} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white mb-4 font-sans">[mensaje enviado]</h1>
          <p className="text-slate-500 mb-8 font-mono">recibido. te respondemos en menos de 24 horas a tu correo.</p>
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
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-white font-medium hover:text-copper transition-colors">
                {CONTACT_EMAIL}
              </a>
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
              name="name"
              required
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              disabled={submitting}
              className="w-full bg-[#050505] border border-slate-800 rounded-none px-4 py-3 text-white placeholder-slate-600 focus:border-copper outline-none transition-all duration-300 font-mono text-xs disabled:opacity-50"
              placeholder="[tu nombre]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">// email</label>
            <input
              id="email"
              name="email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={submitting}
              className="w-full bg-[#050505] border border-slate-800 rounded-none px-4 py-3 text-white placeholder-slate-600 focus:border-copper outline-none transition-all duration-300 font-mono text-xs disabled:opacity-50"
              placeholder="[tu@email.com]"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">// mensaje</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={form.mensaje}
              onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
              disabled={submitting}
              className="w-full bg-[#050505] border border-slate-800 rounded-none px-4 py-3 text-white resize-none placeholder-slate-600 focus:border-copper outline-none transition-all duration-300 font-mono text-xs disabled:opacity-50"
              placeholder="[cuéntanos sobre tu proyecto...]"
            />
          </div>

          {/* Consentimiento de datos (riesgo #9 del checklist) */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={submitting}
              className="mt-0.5 w-3.5 h-3.5 accent-[#C97352] shrink-0"
            />
            <span className="text-[11px] font-mono text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
              acepto el{' '}
              <Link href="/legal/privacidad" target="_blank" className="text-copper underline underline-offset-2 hover:text-amber-500">
                aviso de privacidad
              </Link>{' '}
              y el tratamiento de mis datos para responder esta solicitud.
            </span>
          </label>

          {error && (
            <p className="text-xs font-mono text-red-400 lowercase">✗ {error}</p>
          )}

          <SmartButton type="submit" disabled={submitting || !consent} className="w-full py-3.5">
            {submitting
              ? '> enviando...'
              : <><span>enviar mensaje</span><Send className="ml-2 w-3.5 h-3.5" strokeWidth={1} /></>}
          </SmartButton>
        </form>
      </SmartCard>
    </div>
  );
}
