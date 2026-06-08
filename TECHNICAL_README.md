# RZStudio: Arquitectura Técnica de Alto Impacto

Este documento detalla los pilares técnicos que sostienen a **RZStudio**, una
plataforma diseñada para demostrar la excelencia en ingeniería de software e
inteligencia artificial.

## 🧠 Inteligencia Polimórfica (Hardware-Aware UI)

La característica estrella del sitio es su capacidad de mutar visualmente
basándose en las capacidades del hardware del usuario final.

### Cómo funciona:

1.  **Detección:** Utilizamos el hook `useHardwareCapability.ts` que analiza:
* `navigator.deviceMemory`: RAM disponible (Gama alta > 8GB).
* `hardwareConcurrency`: Número de núcleos lógicos del CPU.
2.  **Tiers de Calidad:** Clasificamos el dispositivo en 4 niveles: `ESSENTIAL`, `
    BALANCED`, `HIGH`, `ULTRA`.
3.  **Adaptación:** El `HardwareContext` distribuye una configuración que afecta
    a:
* **Partículas 3D:** De 0 (fondo estático) a 5,000 partículas dinámicas.
* **Blur (Glassmorphism):** Activado solo en `HIGH/ULTRA`.
* **Animaciones:** Framer Motion ajusta la complejidad y duración.

## 🧪 Calidad Garantizada (Protocolo TDD)

Cada línea de código ha sido validada mediante **Test-Driven Development**
utilizando Vitest.

* **Cobertura:** 25 Tests Unitarios y de Integración.
* **Mocks de IA:** Los tests validan el flujo de datos incluso sin conexión real
  a la API de Claude.
* **Aislamiento:** Los componentes UI se prueban independientemente del contexto
  3D.

## 🛠️ Stack Tecnológico

* **Framework:** Next.js 14+ (App Router).
* **Estilos:** Tailwind CSS v4 (Sintaxis moderna de gradientes).
* **Animaciones:** Framer Motion & GSAP.
* **3D Engine:** Three.js con @react-three/fiber y @react-three/drei.
* **IA:** Integración nativa con Claude 3 Sonnet mediante Route Handlers.

- - -
*Desarrollado por el equipo de RZStudio.*

