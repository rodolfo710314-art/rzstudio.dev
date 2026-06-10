'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHardware } from '@/context/HardwareContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartButton } from './SmartButton';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { name: 'inicio', href: '/' },
  { name: 'la estrella', href: '/la-estrella' },
  { name: 'servicios', href: '/servicios' },
  { name: 'portfolio', href: '/portfolio' },
  { name: 'proceso', href: '/proceso' },
  { name: 'simbiosis', href: '/simbiosis' },
  { name: 'ia', href: '/ia' },
  { name: 'blog', href: '/blog' },
];

export function Navbar() {
  const pathname = usePathname();
  const { config } = useHardware();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        border-b border-[#1D140F]
        ${config.useBlur ? 'glass' : 'bg-[#050505]'}
      `}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="rzstudio.dev">
            <div className="relative py-2 flex items-center justify-center">
              <svg viewBox="0 0 600 200" className="w-36 md:w-48 h-auto drop-shadow-[0_0_14px_rgba(56,189,248,0.35)]">
                <defs>
                  {/* Blue breeze — sweeps across the full "RZStudio.dev" in userSpace coords */}
                  <linearGradient id="blueSweep" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="-100" y2="0">
                    <stop offset="0%"   stopColor="transparent" />
                    <stop offset="30%"  stopColor="#38bdf8" stopOpacity="0.55" />
                    <stop offset="50%"  stopColor="#e0f2fe" stopOpacity="1" />
                    <stop offset="70%"  stopColor="#38bdf8" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="transparent" />
                    <animate attributeName="x1" from="-300" to="700" dur="5s" repeatCount="indefinite" />
                    <animate attributeName="x2" from="-100" to="900" dur="5s" repeatCount="indefinite" />
                  </linearGradient>

                  {/* Neon glow applied to the sweep layer */}
                  <filter id="blueGlow" x="-5%" y="-40%" width="110%" height="180%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* White star base — single stroke, no double outline */}
                <text x="20" y="130" fontFamily="'Inter', sans-serif" fontWeight="200" fontSize="84"
                  fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5">RZStudio</text>

                {/* Blue sweep overlay — same strokeWidth to avoid doubling */}
                <text x="20" y="130" fontFamily="'Inter', sans-serif" fontWeight="200" fontSize="84"
                  fill="none" stroke="url(#blueSweep)" strokeWidth="1.5" filter="url(#blueGlow)">RZStudio</text>

                {/* .dev — white base */}
                <text x="487" y="130" fontFamily="'JetBrains Mono', monospace" fontWeight="100" fontSize="32"
                  fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.55)" strokeWidth="1">.dev</text>

                {/* .dev — blue sweep */}
                <text x="487" y="130" fontFamily="'JetBrains Mono', monospace" fontWeight="100" fontSize="32"
                  fill="none" stroke="url(#blueSweep)" strokeWidth="1" filter="url(#blueGlow)">.dev</text>
              </svg>
            </div>
          </Link>

          {/* LINKS (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    text-xs font-mono lowercase tracking-wider transition-colors relative py-2
                    ${isActive ? 'text-copper' : 'text-slate-400 hover:text-white'}
                  `}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-copper shadow-[0_0_8px_#C97352]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <Link href="/contacto" className="hidden md:inline-flex">
              <SmartButton size="sm" variant="primary">
                contacto
              </SmartButton>
            </Link>

            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden w-10 h-10 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-copper transition-all duration-300"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'cerrar menú' : 'abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="menú de navegación"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className={`
              fixed top-20 left-0 right-0 z-40 border-b border-[#1D140F]
              ${config.useBlur ? 'glass' : 'bg-[#050505]'}
              md:hidden
            `}
          >
            <nav className="container mx-auto px-6 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      py-3 px-2 text-sm font-mono lowercase tracking-wider border-b border-slate-900 flex items-center justify-between transition-colors
                      ${isActive ? 'text-copper' : 'text-slate-400 hover:text-white'}
                    `}
                  >
                    {link.name}
                    {isActive && <span className="w-1.5 h-1.5 bg-copper rounded-none" />}
                  </Link>
                );
              })}
              <div className="pt-4">
                <Link href="/contacto">
                  <SmartButton size="sm" variant="primary" className="w-full">
                    contacto
                  </SmartButton>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
