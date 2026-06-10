# Roadmap de Proyecto: RZStudio

Este documento detalla el progreso y las fases de implementación del sitio web corporativo de RZStudio. Se han integrado las propuestas de **Inteligencia Polimórfica**, **TDD para IA** e **Integración CRM**.

---

## 🚦 Resumen de Progreso
- **Estado Actual:** Fase 1 (Inicialización)
- **Progreso Global:** 5%
- **Última Actualización:** 12 de Mayo, 2026

---

## 🗺️ Fases del Proyecto

### Fase 1: Arquitectura y Base (Semana 1-2)
*Objetivo: Configurar el entorno de desarrollo con los más altos estándares de calidad.*

- [ ] **Configuración del Repositorio:** Next.js 14, TypeScript, Vitest.
- [ ] **Infraestructura de Testing (TDD):** Configuración de mocks para Supabase y Anthropic API.
- [ ] **Engine Polimórfico (Core):** Implementación del hook `useHardwareCapability` para detección de performance del cliente.
- [ ] **Diseño Base:** Configuración de Tailwind CSS con los tokens de la ficha técnica.

### Fase 2: Sistema de Diseño e Inteligencia de Adaptación (Semana 3-4)
*Objetivo: Crear los componentes que reaccionan al hardware del usuario.*

- [ ] **Componentes UI Atómicos:** Botones, Inputs, Cards (con sus respectivos `.test.tsx`).
- [ ] **Lógica Polimórfica:** Definición de "Tiers" de experiencia (Low, Mid, High, Ultra).
- [ ] **Layout Principal:** Implementación de navegación y footer responsivos.

### Fase 3: Núcleo y Datos (Semana 5-8)
*Objetivo: Implementar la funcionalidad base del sitio y persistencia.*

- [ ] **Páginas Estáticas:** Home, Servicios, Proceso.
- [ ] **Integración Supabase:** Configuración de tablas para Portfolio y Blog.
- [ ] **Módulo de Portfolio:** Grid dinámico con filtros interactivos.
- [ ] **Módulo de Blog:** Integración con CMS o Markdown.

### Fase 4: Integración de IA y CRM (Semana 9-10)
*Objetivo: Desplegar el motor de IA con validación técnica.*

- [ ] **Smart Chatbot:** Integración con Claude Sonnet 4.
- [ ] **IA Testing Suite:** Pruebas de consistencia y validación de prompts (TDD avanzado).
- [ ] **Calculadora de ROI:** Lógica de negocio potenciada por IA.
- [ ] **Integración CRM:** Conexión de formularios con el flujo de leads.

### Fase 5: Experiencia 3D Polimórfica (Semana 11-12)
*Objetivo: Inyectar el factor "WOW" adaptativo.*

- [ ] **Hero 3D (Neural Net):** Escena adaptativa en Three.js.
- [ ] **Timeline Proyectivo:** Visualización 3D de la evolución de la IA.
- [ ] **Optimización de Assets:** Implementación de carga por capas según el Tier detectado.

### Fase 6: QA, SEO y Lanzamiento (Semana 13-14)
*Objetivo: Asegurar la excelencia antes del despliegue final.*

- [ ] **Auditoría WCAG 2.1 AA:** Validación de accesibilidad.
- [ ] **Performance Audit:** Cumplimiento de Core Web Vitals en todos los Tiers.
- [ ] **Despliegue en Vercel:** Configuración de CI/CD y monitoring (Sentry).
- [ ] **Lanzamiento Oficial.**

---

## 🛠️ Registro de Decisiones Técnicas (ADR)

| Fecha | Decisión | Razón |
| :--- | :--- | :--- |
| 12/05/2026 | Inteligencia Polimórfica | Sustituye al fallback tradicional para ofrecer una experiencia adaptada al hardware específico del usuario, demostrando superioridad técnica. |
| 12/05/2026 | TDD para IA | Garantizar que las respuestas del chatbot sean consistentes y seguras mediante pruebas de evaluación de prompts. |
| 12/05/2026 | Integración CRM | Centralizar la gestión de leads para escalar el negocio post-lanzamiento. |
| 11/06/2026 | **Firestore** como base de datos (sobre Supabase) | Misma cuenta GCP que Cloud Run (cero credenciales externas), migración 1:1 desde los stores JSON de documentos, búsqueda vectorial nativa suficiente para el RAG de actas. Reversible gracias a la abstracción `jstore.ts`. |
| 11/06/2026 | Orden de implementación A→B→C→D | A: contacto/legales · B: Firestore+GCS · C: LLM unificado con fallback Gemini + TOON · D: UI/accesibilidad. |
| 11/06/2026 | Teléfono de contacto suprimido | Sin disponibilidad de call center; se reincorpora con call center y/o VoBo del abogado. |
| 11/06/2026 | Juez de Hierro con fallback a Gemini | El acta registra qué modelo emitió cada veredicto para trazabilidad (los veredictos pueden diferir entre modelos). |
| 11/06/2026 | TOON para inyección de contexto a agentes | El formato lo decide el consumidor: JSON para código, TOON/tablas para LLMs. El Cost Governor medirá el ahorro real antes/después. |

---

## 📝 Próximas Tareas Inmediatas
1. Crear el proyecto Next.js con la configuración base.
2. Implementar el hook de detección de hardware (Polymorphic Engine).
3. Configurar Vitest para iniciar el ciclo de TDD.
