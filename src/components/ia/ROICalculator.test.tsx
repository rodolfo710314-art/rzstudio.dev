import { render, screen, fireEvent } from '@testing-library/react';
import { ROICalculator } from './ROICalculator';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('ROICalculator', () => {
  it('debería renderizar los controles iniciales', () => {
    render(
      <HardwareProvider>
        <ROICalculator />
      </HardwareProvider>
    );

    expect(screen.getByText(/calculadora de roi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/presupuesto mensual/i)).toBeInTheDocument();
  });

  it('debería calcular el ahorro correctamente al mover los valores', () => {
    render(
      <HardwareProvider>
        <ROICalculator />
      </HardwareProvider>
    );

    const slider = screen.getByLabelText(/presupuesto mensual/i);
    fireEvent.change(slider, { target: { value: '20000' } });
    
    // El ahorro del 62% de 20000 es 12400 (formateado en es-CO como $ 12.400)
    expect(screen.getByText(/\$\s*12\.400/i)).toBeInTheDocument();
  });
});
