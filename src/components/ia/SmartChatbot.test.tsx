import { render, screen, fireEvent } from '@testing-library/react';
import { SmartChatbot } from './SmartChatbot';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('SmartChatbot', () => {
  it('debería abrirse al hacer click en la burbuja', () => {
    render(
      <HardwareProvider>
        <SmartChatbot />
      </HardwareProvider>
    );

    const bubble = screen.getByRole('button');
    fireEvent.click(bubble);
    
    expect(screen.getByPlaceholderText(/preguntar_al_sistema/i)).toBeInTheDocument();
  });

  it('debería mostrar mensajes de bienvenida', () => {
    render(
      <HardwareProvider>
        <SmartChatbot />
      </HardwareProvider>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/Hola! Soy el asistente de RZStudio/i)).toBeInTheDocument();
  });
});
