'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SmartCard } from "@/components/ui/SmartCard";
import { SmartButton } from "@/components/ui/SmartButton";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Category = 'todos' | 'ia' | 'web' | 'apps';

const PROYECTOS = [
  { id: 1, title: "predictor financiero", category: 'ia', metric: "roi +450%", description: "algoritmo de análisis predictivo para fondos de inversión en tiempo real.", tags: ["next.js", "python", "claude api"] },
  { id: 2, title: "e-commerce global", category: 'web', metric: "ventas +120%", description: "plataforma de e-commerce global con personalización dinámica en el edge.", tags: ["next.js", "supabase", "tailwind"] },
  { id: 3, title: "app de salud pro", category: 'apps', metric: "retención +85%", description: "aplicación móvil para monitoreo inteligente de pacientes crónicos.", tags: ["react native", "firebase", "tensorflow"] },
  { id: 4, title: "multi-agente soporte", category: 'ia', metric: "costos -70%", description: "sistema de agentes autónomos que gestionan el 90% del soporte técnico.", tags: ["langchain", "node.js", "anthropic"] },
  { id: 5, title: "saas de logística", category: 'web', metric: "eficiencia +40%", description: "dashboard inteligente para optimización de rutas y flotas.", tags: ["react", "postgresql", "google maps"] },
  { id: 6, title: "smart travel", category: 'apps', metric: "usuarios +300k", description: "guía de viajes generativa que crea itinerarios según el perfil.", tags: ["flutter", "openai", "aws"] }
];

export function PortfolioContent() {
  const [filter, setFilter] = useState<Category>('todos');
  const filteredProjects = PROYECTOS.filter(p => filter === 'todos' || p.category === filter);

  return (
    <section className="container mx-auto px-6 font-mono text-xs lowercase">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl font-sans">
          <div className="font-mono text-[9px] text-slate-500 mb-4 tracking-widest uppercase">// portfolio_projects</div>
          <h1 className="text-6xl font-sans font-light tracking-tight glow-title-strong mb-6">
            NUESTROS <br/> PROYECTOS_
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-light max-w-lg font-sans">cada línea de código está diseñada para generar un impacto medible.</p>
        </div>
        <div className="flex flex-wrap gap-2 font-mono">
          {(['todos', 'ia', 'web', 'apps'] as Category[]).map((cat) => {
            const isActive = filter === cat;
            return (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)} 
                className={`
                  px-5 py-2 border text-[11px] tracking-wider transition-all duration-300
                  ${isActive 
                    ? 'bg-transparent text-white border-copper shadow-[0_0_8px_rgba(201,115,82,0.2)]' 
                    : 'bg-transparent text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'}
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
      
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredProjects.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-20 text-center font-mono text-xs text-slate-600"
            >
              <span className="block mb-2 text-slate-700 text-lg">{'[ 0 resultados ]'}</span>
              // no hay proyectos en esta categoría todavía.
            </motion.div>
          )}
          {filteredProjects.map((proyecto) => (
            <motion.div
              key={proyecto.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SmartCard title={proyecto.title.toUpperCase()} className="h-full flex flex-col group cursor-pointer font-sans">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3 font-mono text-xs lowercase">
                  <span className="px-2 py-0.5 border border-copper/30 bg-transparent text-copper text-[9px] font-bold">
                    [{proyecto.category.toLowerCase()}]
                  </span>
                  <span className="text-white font-bold text-sm tracking-tight">{proyecto.metric.toLowerCase()}</span>
                </div>
                <p className="text-slate-400 text-sm mb-6 flex-1 font-sans font-light leading-relaxed">{proyecto.description}</p>

                {/* tags */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/40 mb-6 font-mono text-xs lowercase">
                  {proyecto.tags.map((tag) => (
                    <span key={tag} className="text-[9px] text-slate-500">[{tag.toLowerCase()}]</span>
                  ))}
                </div>

                <Link href="/contacto" className="block w-full">
                  <SmartButton variant="outline" size="sm" className="w-full">
                    ver case study <ArrowUpRight className="ml-1 w-3 h-3" />
                  </SmartButton>
                </Link>
              </SmartCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
