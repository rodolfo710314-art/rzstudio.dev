import { Suspense } from 'react';
import { SimbiosisShell } from '@/components/simbiosis/SimbiosisShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'rzstudio // simbiosis // laboratorio de i+d',
  description:
    'el laboratorio de investigación y desarrollo interactivo de rzstudio. 6 agentes de ia trabajando en tiempo real.',
};

function Skeleton() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <span className="font-mono text-[12px] text-slate-500 uppercase tracking-widest animate-pulse">
        {'> iniciando núcleo simbiótico...'}
      </span>
    </div>
  );
}

export default function SimbiosisPage() {
  return (
    <main className="relative min-h-screen bg-transparent text-white">
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Section header */}
          <div className="mb-12">
            <span className="font-mono text-[12px] text-copper uppercase tracking-widest block mb-2">
              // laboratorio de i+d interactivo
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase leading-none">
              simbiosis_
            </h1>
            <div className="w-12 h-[1px] bg-copper mt-5" />
          </div>

          {/*
            SimbiosisShell uses useSearchParams — must be wrapped in Suspense
            so the server render doesn't block on client-only URL state.
          */}
          <Suspense fallback={<Skeleton />}>
            <SimbiosisShell />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
