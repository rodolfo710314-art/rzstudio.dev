import { renderHook } from '@testing-library/react';
import { useHardwareCapability, HardwareTier } from './useHardwareCapability';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useHardwareCapability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar ULTRA para hardware potente', () => {
    // Mock de hardware potente
    Object.defineProperty(navigator, 'deviceMemory', { value: 16, configurable: true });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 12, configurable: true });

    const { result } = renderHook(() => useHardwareCapability());
    expect(result.current.tier).toBe(HardwareTier.ULTRA);
  });

  it('debería retornar HIGH para hardware de gama media-alta', () => {
    Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });

    const { result } = renderHook(() => useHardwareCapability());
    expect(result.current.tier).toBe(HardwareTier.HIGH);
  });

  it('debería retornar BALANCED para hardware de gama media', () => {
    Object.defineProperty(navigator, 'deviceMemory', { value: 4, configurable: true });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 4, configurable: true });

    const { result } = renderHook(() => useHardwareCapability());
    expect(result.current.tier).toBe(HardwareTier.BALANCED);
  });

  it('debería retornar ESSENTIAL para hardware limitado', () => {
    Object.defineProperty(navigator, 'deviceMemory', { value: 2, configurable: true });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true });

    const { result } = renderHook(() => useHardwareCapability());
    expect(result.current.tier).toBe(HardwareTier.ESSENTIAL);
  });
});
