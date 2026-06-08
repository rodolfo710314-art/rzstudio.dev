import { render, screen } from '@testing-library/react';
import { SmartButton } from './SmartButton';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('@/hooks/useHardwareCapability', () => ({
  useHardwareCapability: () => ({
    tier: 'ULTRA',
    memory: 16,
    cores: 12,
  }),
  HardwareTier: {
    ESSENTIAL: 'ESSENTIAL',
    BALANCED: 'BALANCED',
    HIGH: 'HIGH',
    ULTRA: 'ULTRA'
  }
}));

describe('SmartButton', () => {
  it('debería renderizar el texto correctamente', () => {
    render(
      <HardwareProvider>
        <SmartButton>Click me</SmartButton>
      </HardwareProvider>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('debería aplicar clases de estilo por defecto', () => {
    render(
      <HardwareProvider>
        <SmartButton>Primary</SmartButton>
      </HardwareProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-copper');
  });
});
