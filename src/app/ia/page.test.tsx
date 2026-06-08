import { render, screen } from '@testing-library/react';
import IAPage from './page';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/ia',
}));

describe('IAPage', () => {
  it('debería renderizar la calculadora de ROI', () => {
    render(
      <HardwareProvider>
        <IAPage />
      </HardwareProvider>
    );

    expect(screen.getByText(/Inteligencia/i)).toBeInTheDocument();
    expect(screen.getByText(/Adaptativa/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculadora de ROI/i)).toBeInTheDocument();
  });
});
