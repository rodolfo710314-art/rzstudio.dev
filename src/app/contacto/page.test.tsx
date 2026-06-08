import { render, screen, fireEvent } from '@testing-library/react';
import ContactoPage from './page';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/contacto',
}));

describe('ContactoPage', () => {
  it('debería renderizar el formulario de contacto', () => {
    render(
      <HardwareProvider>
        <ContactoPage />
      </HardwareProvider>
    );

    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar Mensaje/i })).toBeInTheDocument();
  });

  it('debería mostrar mensaje de éxito al enviar', () => {
    render(
      <HardwareProvider>
        <ContactoPage />
      </HardwareProvider>
    );

    // Buscamos el botón y disparamos el submit del formulario
    const submitBtn = screen.getByRole('button', { name: /Enviar Mensaje/i });
    fireEvent.submit(submitBtn.closest('form')!);
    
    // Verificamos que aparezca el estado de éxito
    expect(screen.getByText(/Mensaje Enviado/i)).toBeInTheDocument();
  });
});
