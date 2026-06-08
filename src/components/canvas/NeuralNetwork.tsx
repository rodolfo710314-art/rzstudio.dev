'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useHardware } from '@/context/HardwareContext';

function SceneContents() {
  const { config } = useHardware();
  const pointsRef = useRef<THREE.Points>(null);
  // Use refs instead of React state to avoid 60 re-renders/sec inside useFrame
  const textRef = useRef<any>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const posRef = useRef<[number, number, number]>([0, 0, -5]);

  const particlesArray = useMemo(() => {
    const count = config.particleCount || 1000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [config.particleCount]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.x -= 0.001;
      pointsRef.current.rotation.y -= 0.0015;
    }

    // Update material opacity directly — no React state, no re-renders
    const pulse = Math.sin((t * Math.PI * 2) / 6);
    const opacity = pulse > 0 ? pulse * 0.45 : 0;

    if (materialRef.current) {
      materialRef.current.opacity = opacity;
    }

    // Reposition text node directly via ref when opacity fades out
    if (opacity < 0.01 && Math.random() < 0.08 && textRef.current) {
      posRef.current = [
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 2.2,
        -5,
      ];
      textRef.current.position.set(...posRef.current);
    }
  });

  return (
    <>
      <Points ref={pointsRef} positions={particlesArray} stride={3}>
        <PointMaterial
          transparent
          color="#8A5B3E"
          size={0.02}
          opacity={0.4}
          depthWrite={false}
        />
      </Points>

      <Text
        ref={textRef}
        position={posRef.current}
        strokeWidth="2%"
        strokeColor="#C97352"
        fillOpacity={0}
        font="https://fonts.gstatic.com/s/jetbrainsmono/v13/tDbY2o-flEEny0FZhsfKu5WU4xyt.woff"
      >
        RZStudio
        <meshBasicMaterial
          ref={materialRef}
          transparent
          blending={THREE.AdditiveBlending}
          opacity={0}
          depthWrite={false}
        />
      </Text>
    </>
  );
}

export function NeuralNetwork() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen -z-50 pointer-events-none bg-[#050505]">
      {webglSupported && (
        <Canvas camera={{ position: [0, 0, 1] }}>
          <SceneContents />
        </Canvas>
      )}
    </div>
  );
}
