'use client';

import { useState, useEffect } from 'react';

export enum HardwareTier {
  ESSENTIAL = 'ESSENTIAL', // Móviles gama baja, tablets antiguas
  BALANCED = 'BALANCED',   // Móviles gama media, laptops oficina
  HIGH = 'HIGH',           // Laptops pro, desktops gama media
  ULTRA = 'ULTRA'          // Workstations, Gaming PCs
}

interface HardwareMetrics {
  tier: HardwareTier;
  memory: number;
  cores: number;
  isLowPowerMode: boolean;
}

/**
 * Hook de Inteligencia Polimórfica
 * Detecta las capacidades del hardware del usuario para adaptar la experiencia visual.
 */
export function useHardwareCapability(): HardwareMetrics {
  const [metrics, setMetrics] = useState<HardwareMetrics>({
    tier: HardwareTier.BALANCED,
    memory: 4,
    cores: 4,
    isLowPowerMode: false
  });

  useEffect(() => {
    // navigator.deviceMemory (RAM en GB)
    // navigator.hardwareConcurrency (Núcleos lógicos)
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    let tier = HardwareTier.BALANCED;

    if (memory >= 16 && cores >= 12) {
      tier = HardwareTier.ULTRA;
    } else if (memory >= 8 && cores >= 8) {
      tier = HardwareTier.HIGH;
    } else if (memory <= 2 || cores <= 2) {
      tier = HardwareTier.ESSENTIAL;
    }

    setMetrics({
      tier,
      memory,
      cores,
      isLowPowerMode: false // Podríamos expandir esto detectando ahorro de batería
    });
  }, []);

  return metrics;
}
