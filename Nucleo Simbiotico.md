## 1. El Switch de Navegación (Cabecera)
Componente: Un selector plano de dos vistas: [ MODO: INTELIGENCIA ADAPTATIVA ] y [ MODO: NÚCLEO SIMBIÓTICO ].
Lógica: No usar useState para alternar. Debe leer y modificar los parámetros de la URL (ej. ?view=simbiosis) usando el router de Next.js.
Interacción: Al cambiar a "Simbiosis", ejecutar una animación CSS de un barrido de luz blanca/gris súper rápida (flash) de máximo 200ms para simular un "encendido" de la consola.
## 2. El Grid del Sandbox (Proyectos Beta)
Layout: Cuadrícula responsiva (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) con gap amplio. Máximo 6 tarjetas en pantalla.
Tarjetas (Cards): Bordes de 1px gris tenue. Sin imágenes.
Cabecera de Tarjeta (Telemetría): Implementar un "Ticker" dinámico de texto monospace que muestre si el motor está operando (ej. [EN TIEMPO REAL: IA Investigando...] 🟢) o en pausa ([STANDBY: Última auditoría...]).
Botones fantasma: "Iniciar Entorno de Prueba" (para web) y "Obtener Binario Seguro" (para Android, que debe abrir un modal de captura de datos).
## 3. El Panel de Diagnóstico (Off-Canvas Drawer)
Layout: Un panel lateral derecho oculto que se desliza al hacer clic en un proyecto del Grid. Fondo negro profundo (bg-zinc-950), borde vertical izquierdo sutil.
Contenido:
Cabecera con métricas simuladas (latencia, tokens, agente activo).
Caja de terminal para mostrar el flujo de conciencia de la IA (logs de auditoría).
Visualizador de diferencias de código (micro-diff).
Botonera Inferior: "EJECUTAR MERGE" (Botón sólido), "PURGAR ENTORNO" (Advertencia sutil) y "REBATIR SOLUCIÓN" (Botón fantasma).
## 4. El War Room (Sala Dialéctica)
Layout: Al presionar "REBATIR SOLUCIÓN", la pantalla cambia a modo inmersivo completo sin distracciones (Split Screen).
Panel Izquierdo: Visualización de documentos, referencias y reportes.
Panel Derecho: Interfaz de chat conversacional limpia. Sin botones de Aceptar/Rechazar. El flujo de aprobación es por detección de texto (Natural Language Processing).
