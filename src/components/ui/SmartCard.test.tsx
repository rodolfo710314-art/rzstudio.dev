import { render, screen } from '@testing-library/react';
import { SmartCard } from './SmartCard';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock de hardware para simular diferentes tiers
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

describe('SmartCard', () => {
  it('debería renderizar el contenido correctamente', () => {
    render(
      <HardwareProvider>
        <SmartCard title="Test Card">
          <p>Contenido del card</p>
        </SmartCard>
      </HardwareProvider>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Contenido del card')).toBeInTheDocument();
  });

  it('debería tener la clase glass en tiers superiores', () => {
    render(
      <HardwareProvider>
        <SmartCard title="Test Card">Card</SmartCard>
      </HardwareProvider>
    );

    const cardElement = screen.getByText('Test Card').closest('div');
    expect(cardElement?.className).toContain('glass');
  });
});
