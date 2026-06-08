import { render, screen } from '@testing-library/react';
import ServiciosPage from './page';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/servicios',
}));

describe('ServiciosPage', () => {
  it('debería renderizar el título de la sección de servicios', () => {
    render(
      <HardwareProvider>
        <ServiciosPage />
      </HardwareProvider>
    );

    expect(screen.getByText(/nuestros/i)).toBeInTheDocument();
    expect(screen.getByText(/servicios/i)).toBeInTheDocument();
    expect(screen.getByText('apps móviles con ia')).toBeInTheDocument();
  });
});
