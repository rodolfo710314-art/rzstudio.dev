import React from 'react';
import Link from 'next/link';
import { Search, PenTool, Code2, Rocket, ArrowDown } from "lucide-react";
import { SmartCard } from "@/components/ui/SmartCard";
import { SmartButton } from "@/components/ui/SmartButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "proceso // rzstudio",
  description: "un camino estructurado desde la idea hasta la excelencia técnica, impulsado por inteligencia artificial.",
};

const PASOS = [
  {
    icon: <Search />,
    title: "descubrimiento ia",
    desc: "analizamos tus procesos actuales y detectamos dónde la ia puede generar el mayor impacto inmediato."
  },
  {
    icon: <PenTool />,
    title: "arquitectura polimórfica",
    desc: "diseñamos sistemas que se adaptan al hardware y comportamiento del usuario, asegurando eficiencia total."
  },
  {
    icon: <Code2 />,
    title: "desarrollo ágil",
    desc: "ciclos rápidos de construcción asistida por ia, garantizando código limpio y tests desde el día uno."
  },
  {
    icon: <Rocket />,
    title: "despliegue & escalado",
    desc: "lanzamiento en infraestructura cloud optimizada con monitoreo inteligente de performance."
  }
];

export default function ProcesoPage() {
  return (
    <main className="pt-32 pb-20 bg-transparent text-white">
      <section className="container mx-auto px-6">
        <div className="max-w-3xl mb-24 text-center mx-auto">
          <div className="font-mono text-[9px] text-slate-500 mb-4 tracking-widest uppercase">// software_lifecycle_pipeline</div>
          <h1 className="text-4xl md:text-6xl font-sans font-light uppercase tracking-tight text-white mb-6">
            nuestro <span className="glow-title-strong">proceso_</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-light font-sans max-w-lg mx-auto">
            un camino estructurado desde la idea hasta la excelencia técnica, impulsado por inteligencia artificial.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative max-w-4xl mx-auto font-mono text-xs lowercase">
          {/* Línea central (desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800 hidden md:block -translate-x-1/2" />

          <div className="space-y-12">
            {PASOS.map((paso, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  {/* Contenido */}
                  <div className="flex-1 w-full">
                    <SmartCard title={paso.title} className="hover:border-copper transition-all duration-300">
                      <p className="text-slate-400 font-sans text-sm">{paso.desc}</p>
                    </SmartCard>
                  </div>

                  {/* Icono Central */}
                  <div className="relative z-10 w-10 h-10 border border-slate-800 bg-[#050505] flex items-center justify-center text-copper rounded-none transition-all duration-300 hover:border-copper hover:shadow-[0_0_10px_rgba(201,115,82,0.4)] shrink-0">
                    {React.cloneElement(paso.icon, { strokeWidth: 1, className: "w-4 h-4" })}
                  </div>

                  {/* Espaciador (desktop) */}
                  <div className="flex-1 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-32 text-center">
          <Link href="/contacto" className="inline-flex flex-col items-center gap-4 font-mono text-xs lowercase group">
            <p className="text-slate-500 group-hover:text-copper transition-colors">// ¿listo para compilar?</p>
            <div className="w-[1px] h-12 bg-copper" />
            <ArrowDown className="text-copper animate-bounce w-4 h-4" strokeWidth={1} />
            <SmartButton variant="primary" size="lg">iniciar proyecto_</SmartButton>
          </Link>
        </div>
      </section>
    </main>
  );
}
