import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock de navegación de Next.js
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navbar', () => {
  it('debería renderizar el logo y los links principales', () => {
    render(
      <HardwareProvider>
        <Navbar />
      </HardwareProvider>
    );

    expect(screen.getByRole('link', { name: /rzstudio\.dev/i })).toBeInTheDocument();
    expect(screen.getByText('la estrella')).toBeInTheDocument();
    expect(screen.getByText('servicios')).toBeInTheDocument();
  });
});
