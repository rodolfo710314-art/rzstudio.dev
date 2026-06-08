import React from 'react';
import { SmartCard } from "@/components/ui/SmartCard";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "blog // rzstudio",
  description: "exploramos la intersección entre el diseño humano y la potencia de la inteligencia artificial.",
};

const POSTS = [
  {
    id: 1,
    title: "el futuro de la arquitectura polimórfica",
    excerpt: "descubre cómo los sitios web que se adaptan al hardware están cambiando la retención de usuarios.",
    date: "12 may, 2026",
    readTime: "5 min",
    category: "arquitectura",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "ia vs deuda técnica",
    excerpt: "cómo el desarrollo asistido por modelos de lenguaje está eliminando el código redundante.",
    date: "10 may, 2026",
    readTime: "8 min",
    category: "ingeniería",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "optimización 3d en la web",
    excerpt: "secretos para renderizar escenas complejas sin destruir la batería del móvil.",
    date: "08 may, 2026",
    readTime: "6 min",
    category: "performance",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <main className="pt-32 pb-20 bg-transparent text-white">
      <section className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <div className="font-mono text-[9px] text-slate-500 mb-4 tracking-widest uppercase">// rz_engineering_logs</div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6 font-sans">
            últimas <span className="text-copper">publicaciones_</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-sans font-light max-w-lg">
            exploramos la intersección entre el diseño humano y la potencia de la inteligencia artificial.
          </p>
        </div>

        {/* FEATURED POST */}
        <div className="mb-20 font-mono text-xs lowercase">
          <div className="relative group rounded-none border border-slate-800 bg-[#0c0806] flex flex-col md:flex-row gap-8 p-4 md:p-8">
            <div className="flex-1 relative aspect-video md:aspect-auto h-[300px] md:h-auto rounded-none overflow-hidden border border-slate-800">
               <img 
                src={POSTS[0].image} 
                alt={POSTS[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center py-6">
              <span className="text-copper text-[10px] tracking-widest font-bold uppercase mb-4 block font-mono">// destacado</span>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight uppercase font-sans">
                {POSTS[0].title}
              </h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed font-sans font-light">
                {POSTS[0].excerpt}
              </p>
              <div className="flex items-center gap-6 text-slate-500 text-xs mb-8">
                 <span className="flex items-center gap-1.5"><Calendar size={12} strokeWidth={1} /> {POSTS[0].date}</span>
                 <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={1} /> {POSTS[0].readTime}</span>
              </div>
              <button className="text-white font-bold flex items-center gap-2 group/btn font-mono tracking-wide text-xs">
                leer artículo completo <ArrowRight className="group-hover/btn:translate-x-2 transition-transform text-copper w-3.5 h-3.5" strokeWidth={1} />
              </button>
            </div>
          </div>
        </div>

        {/* GRID POSTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.slice(1).map((post) => (
            <SmartCard key={post.id} title={post.title} className="flex flex-col group h-full font-mono text-xs lowercase">
              <div className="aspect-video rounded-none overflow-hidden mb-6 relative border border-slate-800/80">
                 <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 />
              </div>
              <p className="text-slate-400 text-sm mb-6 flex-1 font-sans font-light leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center justify-between mt-auto border-t border-slate-800/40 pt-4">
                 <span className="text-[9px] border border-slate-800 text-slate-400 px-2 py-0.5 rounded-none uppercase font-bold">[{post.category}]</span>
                 <button className="text-copper hover:text-white transition-all duration-300">
                    <ArrowRight size={16} strokeWidth={1} />
                 </button>
              </div>
            </SmartCard>
          ))}
        </div>
      </section>
    </main>
  );
}
