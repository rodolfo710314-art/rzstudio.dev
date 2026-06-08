import React from 'react';
import type { Metadata } from 'next';
import { ROICalculator } from "@/components/ia/ROICalculator";
import { TraditionalVsAI } from "@/components/ia/TraditionalVsAI";
import { Cpu, Brain, Zap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "ia // rzstudio",
  description: "inteligencia adaptativa: herramientas de ia que transforman tu estructura de costos y aceleran tu crecimiento.",
};

const TECH_STACK = [
  { icon: <Brain strokeWidth={1} />, title: "llms propios", desc: "despliegue de modelos privados." },
  { icon: <Cpu strokeWidth={1} />, title: "edge computing", desc: "ia procesada en el cliente." },
  { icon: <Zap strokeWidth={1} />, title: "optimización", desc: "modelos ligeros y rápidos." },
  { icon: <Shield strokeWidth={1} />, title: "privacidad", desc: "seguridad de grado bancario." },
];

export default function IAPage() {
  return (
    <main className="pt-32 pb-20 bg-transparent text-white font-mono text-xs lowercase">
      <section className="container mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-2">
            // inteligencia_adaptativa
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase leading-none mb-6 font-sans">
            motor ia_
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-sans font-light max-w-xl">
            explora cómo nuestras herramientas de ia pueden transformar tu estructura de costos
            y acelerar tu crecimiento. transparencia total a través de datos.
          </p>
          <div className="w-12 h-[1px] bg-copper mt-6" />
        </div>

        {/* ROI CALCULATOR */}
        <div className="mb-24">
          <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-6">
            // calculadora de impacto
          </span>
          <ROICalculator />
        </div>

        {/* COMPARATIVO METODOLOGÍAS */}
        <div className="mb-24">
          <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-6">
            // comparativo de metodologías
          </span>
          <TraditionalVsAI />
        </div>

        {/* TECH STACK */}
        <div>
          <span className="font-mono text-[10px] text-copper uppercase tracking-widest block mb-6">
            // stack tecnológico
          </span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {TECH_STACK.map((item, index) => (
              <div
                key={index}
                className="text-center p-6 border border-slate-800 bg-[#050505] hover:border-copper transition-all duration-300"
              >
                <div className="w-12 h-12 border border-slate-800 text-copper flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold mb-2 font-mono text-xs uppercase tracking-wider">{item.title}</h3>
                <p className="text-slate-500 text-[10px] font-mono">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}
