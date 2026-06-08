import { render, screen } from '@testing-library/react';
import ProcesoPage from './page';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/proceso',
}));

describe('ProcesoPage', () => {
  it('debería renderizar los pasos del proceso', () => {
    render(
      <HardwareProvider>
        <ProcesoPage />
      </HardwareProvider>
    );

    expect(screen.getAllByText(/Nuestro/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Proceso/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Descubrimiento/i)).toBeInTheDocument();
    expect(screen.getByText(/Despliegue/i)).toBeInTheDocument();
  });
});
