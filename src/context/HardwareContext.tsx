'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useHardwareCapability, HardwareTier } from '@/hooks/useHardwareCapability';

interface HardwareConfig {
  particleCount: number;
  useBlur: boolean;
  enableShadows: boolean;
  animationComplexity: 'low' | 'medium' | 'high';
  textureQuality: 'low' | 'medium' | 'high';
}

interface HardwareContextType {
  tier: HardwareTier;
  config: HardwareConfig;
}

const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

const TIER_CONFIGS: Record<HardwareTier, HardwareConfig> = {
  [HardwareTier.ESSENTIAL]: {
    particleCount: 500,
    useBlur: false,
    enableShadows: false,
    animationComplexity: 'low',
    textureQuality: 'low',
  },
  [HardwareTier.BALANCED]: {
    particleCount: 1500,
    useBlur: true,
    enableShadows: false,
    animationComplexity: 'medium',
    textureQuality: 'medium',
  },
  [HardwareTier.HIGH]: {
    particleCount: 3000,
    useBlur: true,
    enableShadows: true,
    animationComplexity: 'high',
    textureQuality: 'high',
  },
  [HardwareTier.ULTRA]: {
    particleCount: 5000,
    useBlur: true,
    enableShadows: true,
    animationComplexity: 'high',
    textureQuality: 'high',
  },
};

export const HardwareProvider = ({ children }: { children: ReactNode }) => {
  const { tier } = useHardwareCapability();

  const value = useMemo(() => ({
    tier,
    config: TIER_CONFIGS[tier],
  }), [tier]);

  return (
    <HardwareContext.Provider value={value}>
      <div className={`tier-${tier.toLowerCase()}`}>
        {children}
      </div>
    </HardwareContext.Provider>
  );
};

export const useHardware = () => {
  const context = useContext(HardwareContext);
  if (context === undefined) {
    throw new Error('useHardware debe usarse dentro de un HardwareProvider');
  }
  return context;
};
