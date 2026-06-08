import { render, screen } from '@testing-library/react';
import EstrellaPage from './page';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/la-estrella',
}));

describe('EstrellaPage', () => {
  it('debería renderizar el núcleo de la Estrella IA', () => {
    render(
      <HardwareProvider>
        <EstrellaPage />
      </HardwareProvider>
    );

    expect(screen.getAllByText(/simbiosis/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/multi-inteligencia/i)).toBeInTheDocument();
    expect(screen.getByText(/manifesto/i)).toBeInTheDocument();
  });
});
