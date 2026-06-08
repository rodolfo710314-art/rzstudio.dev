'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHardware } from '@/context/HardwareContext';
import { motion } from 'framer-motion';
import { SmartButton } from './SmartButton';

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

  return (
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
            <svg viewBox="0 0 600 200" className="w-48 h-auto drop-shadow-[0_0_10px_rgba(201,115,82,0.3)]">
              <defs>
                <linearGradient id="glowLoop" x1="0%" y1="0%" x2="200%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="30%" stopColor="#8A5B3E" /> {/* Rich Roast Coffee */}
                  <stop offset="45%" stopColor="#C97352" /> {/* Liquid Copper */}
                  <stop offset="80%" stopColor="transparent" />
                  <animate attributeName="x1" from="-100%" to="200%" dur="6s" repeatCount="indefinite" />
                  <animate attributeName="x2" from="0%" to="300%" dur="6s" repeatCount="indefinite" />
                </linearGradient>
              </defs>
              <text x="20" y="130" fontFamily="'Inter', sans-serif" fontWeight="200" fontSize="84" fill="none" stroke="#3A271E" strokeWidth="1">RZStudio</text>
              <text x="20" y="130" fontFamily="'Inter', sans-serif" fontWeight="200" fontSize="84" fill="none" stroke="url(#glowLoop)" strokeWidth="1.5">RZStudio</text>
              <text x="485" y="130" fontFamily="'JetBrains Mono', monospace" fontWeight="100" fontSize="32" fill="none" stroke="#3A271E" strokeWidth="0.5">.dev</text>
              <text x="485" y="130" fontFamily="'JetBrains Mono', monospace" fontWeight="100" fontSize="32" fill="none" stroke="url(#glowLoop)" strokeWidth="0.75">.dev</text>
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

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link href="/contacto">
            <SmartButton size="sm" variant="primary">
              contacto
            </SmartButton>
          </Link>
        </div>
      </div>
    </nav>
  );
}
