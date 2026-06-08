import React from 'react';
import { SmartCard } from "@/components/ui/SmartCard";
import { SmartButton } from "@/components/ui/SmartButton";
import { Smartphone, Globe, Bot, ShieldCheck, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "servicios // rzstudio",
  description: "desarrollamos soluciones personalizadas: apps con ia, sitios web inteligentes y automatización avanzada.",
};

const SERVICIOS = [
  {
    title: "apps móviles con ia",
    description: "desarrollamos aplicaciones nativas e híbridas que aprenden del usuario, optimizando la retención y la experiencia personalizada.",
    icon: <Smartphone />,
    features: ["personalización en tiempo real", "procesamiento offline", "ux predictiva"]
  },
  {
    title: "sitios web inteligentes",
    description: "no solo sitios estáticos, sino plataformas dinámicas que se adaptan al comportamiento del visitante para maximizar conversiones.",
    icon: <Globe />,
    features: ["seo dinámico por ia", "a/b testing automático", "performance ultra-rápida"]
  },
  {
    title: "automatización y multi-agentes",
    description: "sistemas de agentes autónomos que colaboran para resolver tareas complejas, desde atención al cliente hasta análisis de datos masivos.",
    icon: <Bot />,
    features: ["integración con claude/gpt", "workflows autónomos", "reducción de costos operativos"]
  },
  {
    title: "consultoría en ia y tech",
    description: "asesoramiento estratégico para integrar ia en tu modelo de negocio actual, asegurando escalabilidad y seguridad de datos.",
    icon: <ShieldCheck />,
    features: ["auditoría de infraestructura", "estrategia de datos", "formación técnica"]
  }
];

export default function ServiciosPage() {
  return (
    <main className="pt-32 pb-20 bg-transparent text-white">
      <section className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <div className="font-mono text-[9px] text-slate-500 mb-4 tracking-widest uppercase">// active_modules_v4.2</div>
          <h1 className="text-4xl md:text-6xl font-sans font-light uppercase tracking-tight text-white mb-6">
            nuestros <span className="glow-title-strong">servicios_</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-xl font-sans">
            fusionamos la ingeniería de software de alto nivel con las capacidades más avanzadas 
            de inteligencia artificial para crear productos que parecen magia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICIOS.map((servicio, index) => (
            <SmartCard 
              key={index}
              title={servicio.title}
              icon={servicio.icon}
              className="flex flex-col h-full font-mono text-xs lowercase"
            >
              <p className="mb-6 text-slate-400 font-sans text-sm">{servicio.description}</p>
              <ul className="space-y-3 mb-8 flex-1 font-mono text-xs">
                {servicio.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3 text-slate-300">
                    <div className="w-1.5 h-1.5 border border-copper bg-transparent rounded-none" />
                    {feature}
                  </li>
                ))}
              </ul>
              <SmartButton variant="outline" className="w-full group">
                saber más 
                <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </SmartButton>
            </SmartCard>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="mt-32 bg-[#0c0806] border-y border-slate-800 py-20 font-mono text-xs lowercase">
        <div className="container mx-auto px-6 text-center">
          <div className="text-[10px] text-copper mb-2 tracking-widest">// consultas_especiales</div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 font-sans uppercase">
            ¿no encuentras lo que buscas?
          </h2>
          <p className="text-slate-400 mb-10 max-w-lg mx-auto font-sans">
            desarrollamos soluciones personalizadas para desafíos técnicos únicos. 
            cuéntanos tu idea y la haremos realidad.
          </p>
          <SmartButton size="lg" variant="primary">
            consultar proyecto especial
          </SmartButton>
        </div>
      </section>
    </main>
  );
}
