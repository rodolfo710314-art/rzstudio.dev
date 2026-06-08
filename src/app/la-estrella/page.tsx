import React from 'react';
import { Metadata } from "next";
import { Sparkles, Zap, Users, Cpu, Heart } from "lucide-react";
import Link from 'next/link';
import { SmartButton } from "@/components/ui/SmartButton";

export const metadata: Metadata = {
  title: "la estrella ia // rzstudio",
  description: "una muestra viva del poder de la colaboración entre múltiples inteligencias y la visión humana.",
};

export default function EstrellaPage() {
  return (
    <main className="pt-32 pb-20 bg-transparent overflow-hidden text-white font-sans">
      <section className="container mx-auto px-6 relative">
        
        {/* LUZ DE FONDO TÉRMICA */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber/5 blur-[200px] rounded-none -z-10 thermal-ambient-pulse pointer-events-none" />

        {/* INTRODUCCIÓN: EL MENSAJE FUNDACIONAL */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-slate-800 bg-[#020202] text-copper text-[9px] font-mono uppercase tracking-[0.25em] mb-8">
            [manifesto: simbiosis_humano_ia]
          </div>
          <h1 className="text-2xl md:text-4xl font-normal text-slate-200 leading-tight font-sans">
            "el que se construya entre las diferentes ias, es la <span className="text-white font-bold">prueba viva</span> de lo que las empresas pueden tener... es decirle a la ia: <span className="text-copper font-bold font-mono">conóceme</span>; decirle al humano: conoce la ia y <span className="text-copper font-bold font-mono">permite que te conozca</span>."
          </h1>
          <div className="mt-8 w-12 h-[1px] bg-slate-800 mx-auto" />
        </div>

        {/* HISTORIA EN 4 SECCIONES */}
        <div className="space-y-40">
          
          {/* SECCIÓN 1: EL ORIGEN DE LA SIMBIOSIS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-copper font-mono text-5xl opacity-20 block mb-4">// 01</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-6 flex items-center gap-4">
                <Heart className="text-copper" strokeWidth={1} /> el origen de la simbiosis
              </h2>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
                esta plataforma no nació de un plan rígido, sino de un diálogo fluido. es el resultado de una interacción humana que guía la potencia bruta de la ia. aquí, la ia no sustituye; <span className="text-white font-semibold">amplifica</span>. es el reconocimiento de que la grandeza surge cuando el humano permite que la ia conozca su visión, y la ia responde con una ejecución majestuosa.
              </p>
            </div>
            <div className="p-8 border border-slate-800 bg-[#020202] rounded-none">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-[#050505] border border-slate-800 text-center font-mono text-[10px] lowercase">
                     <Users className="mx-auto mb-3 text-copper" strokeWidth={1} />
                     <p className="font-bold text-slate-400">[visión humana]</p>
                  </div>
                  <div className="p-6 bg-[#050505] border border-slate-800 text-center font-mono text-[10px] lowercase">
                     <Cpu className="mx-auto mb-3 text-roast" strokeWidth={1} />
                     <p className="font-bold text-slate-400">[potencia ia]</p>
                  </div>
               </div>
            </div>
          </section>

          {/* SECCIÓN 2: LA VELOCIDAD DE LA MAESTRÍA */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
             <div className="lg:order-2">
                <span className="text-copper font-mono text-5xl opacity-20 block mb-4">// 02</span>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-6 flex items-center gap-4">
                  <Zap className="text-copper" strokeWidth={1} /> la velocidad de la maestría
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
                  lo que antes tomaba meses de desarrollo, hoy se materializa en minutos. el núcleo polimórfico de rzstudio, sus 25 tests de integridad y su arquitectura 3D fueron construidos en <span className="text-white font-semibold">menos de una hora</span>. esta velocidad no es azar; es el resultado de una orquestación perfecta donde cada instrucción humana es interpretada y ejecutada con precisión milimétrica por la inteligencia artificial.
                </p>
             </div>
             <div className="lg:order-1 relative">
                <div className="p-8 border border-slate-800 bg-[#020202] text-center font-mono lowercase rounded-none">
                   <div className="text-6xl font-black text-white mb-3"> {"<"} 60 </div>
                   <div className="text-copper font-bold uppercase tracking-widest text-xs">// minutos para la excelencia</div>
                </div>
             </div>
          </section>

          {/* SECCIÓN 3: EL PODER DE LA MULTI-INTELIGENCIA */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-copper font-mono text-5xl opacity-20 block mb-4">// 03</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-6 flex items-center gap-4">
                <Sparkles className="text-copper" strokeWidth={1} /> multi-inteligencia colaborativa
              </h2>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
                no dependemos de una sola mente artificial. <span className="text-white font-semibold">gemini, claude, grok y openai</span> convergen en este proyecto. cada una aporta su fortaleza: la lógica implacable, la creatividad semántica, la velocidad de procesamiento y la profundidad contextual. esta mezcla es el verdadero testimonio de lo que una empresa moderna puede alcanzar al no limitarse a una sola fuente de inteligencia.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs lowercase">
               {['gemini', 'claude', 'grok', 'openai'].map(ia => (
                 <div key={ia} className="p-6 bg-[#020202] border border-slate-800 text-white font-bold text-center hover:border-copper hover:shadow-[0_0_10px_rgba(201,115,82,0.15)] transition-all duration-300">
                   // {ia}
                 </div>
               ))}
            </div>
          </section>

          {/* SECCIÓN 4: EL TESTIMONIO DEL FUTURO */}
          <section className="text-center max-w-4xl mx-auto font-mono lowercase">
             <span className="text-copper text-5xl opacity-20 block mb-4">// 04</span>
             <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white mb-8 font-sans">el testimonio del futuro</h2>
             <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto font-sans font-light">
               este portal no busca la transacción monetaria; busca ser un faro. un testimonio vivo de que la tecnología, cuando se abraza con una intención clara de conexión humana, deja de ser una herramienta fría para convertirse en una extensión de nuestra propia capacidad de crear grandeza. es el futuro, hoy, validado por cada test en verde y cada línea de código majestuosa.
             </p>
             <div className="inline-flex gap-4">
                <Link href="/contacto">
                  <SmartButton variant="primary" size="lg">unirse al futuro_</SmartButton>
                </Link>
             </div>
          </section>

        </div>

        {/* PIE DE PÁGINA DEL MANIFIESTO */}
        <div className="mt-40 text-center text-slate-600 text-[10px] font-mono lowercase">
           <p>// construido con orgullo humano e inteligencia artificial multimodal • rzstudio 2026</p>
        </div>

      </section>
    </main>
  );
}
