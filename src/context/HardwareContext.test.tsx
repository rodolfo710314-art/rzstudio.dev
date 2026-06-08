import { render, screen } from '@testing-library/react';
import { HardwareProvider, useHardware } from './HardwareContext';
import { HardwareTier } from '@/hooks/useHardwareCapability';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock del hook base
vi.mock('@/hooks/useHardwareCapability', () => ({
  useHardwareCapability: () => ({
    tier: 'ULTRA',
    memory: 16,
    cores: 12,
    isLowPowerMode: false
  }),
  HardwareTier: {
    ESSENTIAL: 'ESSENTIAL',
    BALANCED: 'BALANCED',
    HIGH: 'HIGH',
    ULTRA: 'ULTRA'
  }
}));

const TestComponent = () => {
  const { tier, config } = useHardware();
  return (
    <div>
      <span data-testid="tier">{tier}</span>
      <span data-testid="particles">{config.particleCount}</span>
    </div>
  );
};

describe('HardwareContext', () => {
  it('debería proveer la configuración de ULTRA correctamente', () => {
    render(
      <HardwareProvider>
        <TestComponent />
      </HardwareProvider>
    );

    expect(screen.getByTestId('tier')).toHaveTextContent('ULTRA');
    expect(screen.getByTestId('particles')).toHaveTextContent('5000'); // Valor para Ultra
  });
});
