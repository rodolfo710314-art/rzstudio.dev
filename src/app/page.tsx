import React from 'react';
import { SmartButton } from "@/components/ui/SmartButton";
import { SmartCard } from "@/components/ui/SmartCard";
import { TraditionalVsAI } from "@/components/ia/TraditionalVsAI";
import { Zap, Target, TrendingUp, Cpu, Globe, Layers } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        
        <div className="container relative z-10 mx-auto px-6 text-center">
          {/* TERMINAL STATUS OVERHEAD */}
          <div className="inline-flex items-center gap-6 font-mono text-[9px] text-slate-500 mb-6 uppercase tracking-[0.2em] border border-slate-800/40 px-3 py-1 bg-[#050505]/40 backdrop-blur-xs">
            <span>[core_status: optimal]</span>
            <span className="w-1.5 h-1.5 bg-copper animate-pulse rounded-none" />
            <span>[coordinates: 0x2A // 0x9B]</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter uppercase font-sans glow-title-ambient">
            <span className="text-white">
              desarrollo con ia
            </span>
            <br />
            <span className="glow-title-strong">
              que evoluciona_
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-400 mb-10 leading-relaxed font-sans font-light">
            creamos soluciones inteligentes que se adaptan, predicen y escalan con tu negocio. 
            el futuro del software ya no es estático; es polimórfico y autogestionado en el edge.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SmartButton size="lg" variant="primary">
              ver comparador
            </SmartButton>
            <SmartButton variant="outline" size="lg">
              agendar consulta
            </SmartButton>
          </div>
        </div>
      </section>

      {/* --- VALUE PROPOSITION --- */}
      <section className="py-24 bg-transparent border-t border-[#1D140F] relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 font-mono lowercase">
            <span className="text-[10px] text-copper tracking-widest uppercase block mb-2">// valor_garantizado</span>
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
              por qué elegir rzstudio
            </h2>
            <div className="w-12 h-[1px] bg-copper mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SmartCard 
              title="86% más rápido" 
              icon={<Zap />}
            >
              nuestra metodología de desarrollo asistido por multi-agentes reduce drásticamente el tiempo de lanzamiento sin comprometer la integridad estructural.
            </SmartCard>
            
            <SmartCard 
              title="62% menos inversión" 
              icon={<TrendingUp />}
            >
              optimizamos los procesos de ingeniería técnica para maximizar tu presupuesto y eliminar la deuda técnica desde el primer bloque de compilación.
            </SmartCard>
            
            <SmartCard 
              title="94% satisfacción" 
              icon={<Target />}
            >
              entregamos interfaces y motores inteligentes de grado de ingeniería que no solo funcionan, sino que satisfacen estándares críticos de conversión.
            </SmartCard>
          </div>
        </div>
      </section>

      {/* --- COMPARADOR (SECCIÓN CRÍTICA) --- */}
      <section className="py-24 bg-transparent border-t border-[#1D140F]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 font-mono lowercase">
            <span className="text-[10px] text-copper tracking-widest uppercase block mb-2">// demo_interactiva_central</span>
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
              comparador de rendimiento
            </h2>
            <p className="text-slate-500 text-xs mt-2 max-w-md mx-auto">
              compara el impacto de la metodología de rzstudio frente al desarrollo tradicional e híbrido asistido por ia.
            </p>
            <div className="w-12 h-[1px] bg-copper mx-auto mt-4" />
          </div>

          <TraditionalVsAI />
        </div>
      </section>

      {/* --- SERVICES PREVIEW --- */}
      <section className="py-24 bg-transparent border-t border-[#1D140F]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <span className="font-mono text-copper text-[10px] uppercase tracking-widest block">// capacidades_sistema</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-none uppercase">
                capacidades de próxima generación
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                desde arquitecturas multi-agente hasta interfaces 3D polimórficas, 
                dominamos el stack tecnológico que está redefiniendo la ingeniería en 2026.
              </p>
              
              <div className="space-y-4 font-mono lowercase text-xs">
                {[
                  { icon: <Cpu />, text: "integración de llms privados y rag de alto rendimiento" },
                  { icon: <Globe />, text: "plataformas web dinámicas con seo automatizado" },
                  { icon: <Layers />, text: "arquitecturas polimórficas adaptadas al hardware" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 text-slate-300">
                    <div className="w-8 h-8 border border-slate-800 flex items-center justify-center text-copper">
                      {React.cloneElement(item.icon, { strokeWidth: 1, className: "w-4 h-4" })}
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full border border-slate-800 p-8 bg-[#020202] font-mono text-xs lowercase relative">
              <span className="absolute top-2 right-2 text-[8px] text-slate-700">[sandbox_compiler]</span>
              <div className="space-y-3">
                <div className="text-copper font-bold">// inicializar simulador de servicios...</div>
                <div className="text-slate-500">
                  {"$ rz-core init --platform=web_engine"}
                </div>
                <div className="p-4 border border-[#1D140F] bg-[#050505] space-y-1.5 text-[10px]">
                  <div className="text-emerald-500">✓ módulo de ia en la nube conectado.</div>
                  <div className="text-emerald-500">✓ compilador polimórfico en caliente listo.</div>
                  <div className="text-slate-400">✓ 25/25 pruebas de integridad en verde [0.03ms].</div>
                </div>
                <div className="text-slate-500 mt-2">
                  {"$ status --verbose"}
                </div>
                <div className="text-slate-300 text-[10px]">
                  [estado: activo] • [fps: 60] • [aceleración_gpu: habilitada]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
