import { render, screen } from '@testing-library/react';
import BlogPage from './page';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/blog',
}));

describe('BlogPage', () => {
  it('debería renderizar la sección de artículos', () => {
    render(
      <HardwareProvider>
        <BlogPage />
      </HardwareProvider>
    );

    expect(screen.getByText(/Últimas/i)).toBeInTheDocument();
    expect(screen.getByText(/Publicaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Arquitectura/i)).toBeInTheDocument();
  });
});
