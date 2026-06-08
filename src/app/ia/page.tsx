import React from 'react';
import { ROICalculator } from "@/components/ia/ROICalculator";
import { Cpu, Brain, Zap, Shield } from "lucide-react";

export default function IAPage() {
  return (
    <main className="pt-32 pb-20">
      <section className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Inteligencia <span className="text-primary-600">Adaptativa</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Explora cómo nuestras herramientas de IA pueden transformar tu estructura de costos 
            y acelerar tu crecimiento. Transparencia total a través de datos.
          </p>
        </div>

        {/* CALCULADORA ROI */}
        <div className="mb-32">
          <ROICalculator />
        </div>

        {/* TECH STACK IA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Brain />, title: "LLMs Propios", desc: "Despliegue de modelos privados." },
            { icon: <Cpu />, title: "Edge Computing", desc: "IA procesada en el cliente." },
            { icon: <Zap />, title: "Optimización", desc: "Modelos ligeros y rápidos." },
            { icon: <Shield />, title: "Privacidad", desc: "Seguridad de grado bancario." }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 rounded-2xl border border-slate-800 bg-slate-900/30">
               <div className="w-12 h-12 bg-primary-600/20 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
               </div>
               <h3 className="text-white font-bold mb-2">{item.title}</h3>
               <p className="text-slate-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
