import { render, screen } from '@testing-library/react';
import { NeuralNetwork } from './NeuralNetwork';
import { HardwareProvider } from '@/context/HardwareContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock exhaustivo de React Three Fiber y Drei para entorno JSDOM
vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="canvas" />,
  useFrame: () => {},
  useThree: () => ({ size: { width: 1000, height: 1000 } }),
}));

vi.mock('@react-three/drei', () => ({
  Points: ({ children }: { children: React.ReactNode }) => <div data-testid="points">{children}</div>,
  PointMaterial: () => <div data-testid="point-material" />,
  Float: ({ children }: { children: React.ReactNode }) => <div data-testid="float">{children}</div>,
}));

describe('NeuralNetwork', () => {
  it('debería renderizar el contenedor del Canvas 3D', () => {
    render(
      <HardwareProvider>
        <NeuralNetwork />
      </HardwareProvider>
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});
