import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: true },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-transparent text-white">
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          {children}

          <div className="mt-16 border-t border-slate-800 pt-6 flex flex-wrap gap-6">
            <Link href="/legal/privacidad" className="font-mono text-[11px] text-slate-500 hover:text-copper transition-colors lowercase">
              aviso de privacidad
            </Link>
            <Link href="/legal/terminos" className="font-mono text-[11px] text-slate-500 hover:text-copper transition-colors lowercase">
              términos del programa beta
            </Link>
            <Link href="/" className="font-mono text-[11px] text-slate-600 hover:text-slate-400 transition-colors lowercase ml-auto">
              ← volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
