import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioPage from './page';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/portfolio',
}));

describe('PortfolioPage', () => {
  it('debería renderizar el título y los filtros', () => {
    render(
      <HardwareProvider>
        <PortfolioPage />
      </HardwareProvider>
    );

    // Usamos getAllByText porque "Nuestros" y "Proyectos" podrían repetirse o estar divididos
    expect(screen.getAllByText(/nuestros/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/proyectos/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'todos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ia' })).toBeInTheDocument();
  });

  it('debería filtrar los proyectos al hacer click', () => {
    render(
      <HardwareProvider>
        <PortfolioPage />
      </HardwareProvider>
    );

    // Seleccionamos específicamente el botón de filtro para evitar colisión con los tags de los proyectos
    const filterButton = screen.getByRole('button', { name: 'ia' });
    fireEvent.click(filterButton);
    
    // Verificamos que el proyecto de IA aparezca
    expect(screen.getByText('PREDICTOR FINANCIERO')).toBeInTheDocument();
  });
});
