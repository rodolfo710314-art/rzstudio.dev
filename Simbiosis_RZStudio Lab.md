### Simbiosis - RZStudio Lab. ###
## 1. Visión General
Transformar la sección de "Portafolio" de RZStudio.dev en un Laboratorio de I+D Interactivo. Un ecosistema donde los proyectos (Web/Apps) no solo se exhiben, sino que se prueban en entornos reales y son co-auditados/optimizados por un sistema de agentes LLM con memoria a largo plazo, manteniendo a los usuarios interactuando dentro de una UI de estética neo-minimalista oscura.
## 2. Arquitectura de Interfaz de Usuario (UI)
El frontend dividirá la experiencia para mantener el orden y la limpieza visual.

Proyectos Web/SPA: Entorno de Sandbox incrustado donde el usuario interactúa con la aplicación en vivo (ej. componentes interactivos o flujos de UI).
Proyectos Móviles (Android): Landing page limpia con información técnica, binarios de descarga segura y documentación de pruebas.
Panel de Diagnóstico (El Hub): Un dashboard lateral no intrusivo donde se exponen los insights del motor LLM (rendimiento, estado de pruebas, mejoras sugeridas) sin sobrecargar la experiencia del proyecto principal.
## 3. Fase 1: Inteligencia, Vigilancia y Memoria (RAG)
El cerebro del sistema opera bajo una arquitectura de Retrieval-Augmented Generation para evitar la amnesia del modelo y mantener la relevancia frente al mercado.

Cron de Vigilancia (Googleraptor): Tareas programadas (7, 15 o 30 días) donde el Agente Historiador escanea el mercado buscando nuevas metodologías o tecnologías.
Base de Datos Vectorial: Almacenamiento del contexto histórico de cada proyecto (stack técnico, decisiones de arquitectura, problemas resueltos previos) usando infraestructura cloud.
Chat Dialéctico: Interfaz interna y privada para el administrador (RZStudio). La IA presenta hallazgos en un debate de tú a tú. Se requiere aprobación humana explícita para proceder a la fase de código.
## 4. Fase 2: Acción y Generación de Código
Una vez aprobada una mejora en la Fase 1, se activa el Agente Ingeniero especializado en código, operando de manera aislada y segura.

Integración API de GitHub: La IA interactúa con el repositorio base sin intervención manual.
Aislamiento de Ramas: Creación automatizada de ramas temporales (ej. ai-feature/opt-render) copiando el estado actual del proyecto desde el control de versiones.
Generación de Pull Requests (PR): El agente inyecta el código modificado y genera un PR detallado con las justificaciones técnicas listas para revisión.
## 5. Fase 3: Malla de Seguridad y Pruebas
Ningún código generado por la IA toca producción sin pasar filtros automáticos y humanos.

Pruebas CI/CD en Frío: Ejecución automática de linter, type-checking y pruebas unitarias al abrir el PR. Si falla, el agente recibe el log de error y se auto-corrige.
Entornos Desechables (Hot Testing): Despliegue automatizado en la nube (Preview Deployments) de la rama temporal para pruebas visuales e interactivas.
Veredicto Humano (Merge): Desde el dashboard de RZStudio, el administrador revisa el entorno desechable. Si el resultado es exitoso, se ejecuta el merge a la rama principal. Si falla, se descarta y el entorno temporal se destruye. 

## 6. Arquitectura del Selector de Vistas (Sección IA / Simbiosis)
## 6.1. Comportamiento y Ruteo (El "Cómo")
Implementación UI: Un componente de dos botones (Switch) ubicado en la cabecera, bajo el menú principal. Tipografía monospace, diseño plano y bordes definidos.
Lógica de Estado: No utilizar estado local puro (useState). Implementar mediante parámetros de URL (?view=simbiosis) aprovechando el router de Next.js.
Objetivo: Permitir enlaces directos y compartibles hacia la vista del Laboratorio sin perder la velocidad de una SPA.
## 6.2. Micro-Interacción de Transición
Efecto Visual: Al alternar entre la vista comercial ("Inteligencia Adaptativa") y el laboratorio ("Simbiosis"), ejecutar un "Destello".
Ejecución CSS: Un barrido de luz (flash blanco/gris tenue) sobre el contenedor principal con una duración máxima de 150ms - 200ms usando clases de Tailwind CSS (animate-pulse personalizado o una transición de opacidad acelerada).
Propósito UX: Servir como "limpiador de paladar visual" durante el montaje del nuevo componente para que el cambio de layout no se perciba rígido, simulando el encendido de un motor. ¡Ya tenemos el primer bloque técnico documentado y blindado!
## 7. Arquitectura del Grid de Proyectos (El Sandbox)
## 7.1. Estructura y Comportamiento del Layout
Implementación CSS: Uso estricto de CSS Grid mediante Tailwind (ej. grid-cols-1 md:grid-cols-2 lg:grid-cols-3) con un espaciado (gap) generoso para mantener la respiración visual característica del diseño neo-minimalista.
Diferenciador Visual: Se elimina el uso de mockups (imágenes de dispositivos). En su lugar, el contenedor se diseña como una terminal de monitorización en tiempo real, con bordes de 1px (gris tenue o semitransparente) que evitan la saturación.
## 7.2. Anatomía del Contenedor de Prueba (Card UI)
Cabecera de Estado: Título del proyecto alineado a la izquierda, acompañado en la esquina superior derecha por un indicador de terminal (ej. [STATUS: AWAITING_MERGE] o [TESTING: ACTIVE]).
Metadatos del Motor: Un bloque de texto secundario (2 a 3 líneas máximo) que expone qué tarea específica está ejecutando la IA en ese proyecto actualmente (ej. Auditoría de rendimiento en componentes renderizados).
Botonera Contextual:
Ruta Web: Botón fantasma (ghost button) con el texto "Iniciar Entorno de Prueba" que despliega la UI interactiva.
Ruta Android: Botón de acción con el texto "Obtener Binario Seguro" para descarga directa e instrucciones de instalación.
## 7.3. Micro-Interacciones
Efecto Hover (Simbiosis Activa): Al pasar el cursor sobre la tarjeta, el borde se ilumina sutilmente con el mismo color del "destello" de la transición principal.
Datos Dinámicos: Integración de un micro-componente que simule actividad de código corriendo en el fondo del contenedor al hacer hover, reforzando que el proyecto está vivo y siendo monitoreado. 
## 7. Arquitectura del Grid de Proyectos (El Sandbox) - [ACTUALIZADO]
## 7.1. Comportamiento del Layout (Múltiples Proyectos)
Escalabilidad Visual: El contenedor utiliza una cuadrícula adaptable (grid-cols-1 md:grid-cols-2 lg:grid-cols-3).
Regla de Escasez: Para mantener la estética premium y no saturar, la UI está diseñada para mostrar un máximo de 6 proyectos simultáneos. Los proyectos se apilan manteniendo un espaciado amplio.
## 7.2. Telemetría en Vivo (La Cabecera de la Tarjeta)
Se abandona el estado estático por un "Ticker" (teletipo) que refleja el motor de la IA trabajando.

Estado Activo (Procesando): El texto indica la acción exacta precedida de un indicador parpadeante.
Ejemplo UI: [EN TIEMPO REAL: IA Investigando nuevas librerías para rama /auth] 🟢
Estado en Reposo (Standby): Muestra con precisión cronológica cuándo fue la última intervención o cuándo será la próxima.
Ejemplo UI: [STANDBY: Última auditoría completada el 04/06/2026 a las 15:30h]
## 8. Protocolo de Pruebas Móviles (Android QA)
## 8.1. El Filtro de Acceso (Captura de Datos)
Acción: Al dar clic en "Obtener Binario Seguro", no se inicia la descarga inmediata.
UI/UX: Se despliega un micro-modal estilo terminal pidiendo las credenciales del usuario para darle acceso al entorno de pruebas cerrado.
Datos requeridos: Nombre, Correo y Rol (ej. Desarrollador, Inversor, Curioso). Esto convierte el laboratorio en una máquina de generación de prospectos.
## 8.2. Flujo de Feedback (La Retroalimentación)
Se requieren dos vías de comunicación para no perder la información del tester:

Protocolo In-App (Dentro de la App Android): Se compila la app de prueba con un "Botón Fantasma RZS" flotante y oculto (ej. agitar el teléfono o doble toque con tres dedos) que levanta un formulario rápido para enviar un log de errores o comentarios directo a tu webhook.
Protocolo Externo (Seguimiento Automatizado): 48 horas después de la descarga, el sistema envía un correo en texto plano y diseño brutalista: "¿Sobrevivió el código? Entra aquí y cuéntale al Agente Simbiosis qué falló." Este enlace lleva al usuario de regreso a RZStudio.dev a interactuar con la IA para dejar su reporte. ¡Boom! Con esto ya blindamos la entrada a los mirones y convertimos cada descarga en una oportunidad de negocio, además de que el tablero ya se siente vivo.

## 9. Arquitectura del Panel de Diagnóstico (El Hub Simbiótico)
9.1. Comportamiento y Despliegue (UI)
Off-Canvas Drawer: El panel permanece oculto para proteger la limpieza visual del Sandbox. Se despliega deslizándose desde el borde derecho de la pantalla al interactuar con una tarjeta del grid.
Estética de Consola: Fondo en negro profundo (ej. bg-zinc-950), texto en tipografías monospace (como JetBrains Mono o Fira Code), sin sombras pesadas (Drop Shadows). El límite visual lo marca un borde vertical de 1px en gris muy tenue.
9.2. Anatomía de la Información (Las Entrañas)
El panel se divide en tres bloques jerárquicos verticales:

A. Cabecera de Telemetría: Título del proyecto, etiqueta del agente LLM operando (ej. [AGENTE: INGENIERO_V4]) y métricas en vivo (latencia, tokens procesados, tiempo de vida del entorno temporal).
B. Flujo de Conciencia (Logs en vivo): Un área de lectura tipo terminal. En lugar de un formato de chat tradicional, el usuario observa el "pensamiento" de la IA auditando el código.
Ejemplo: > Analizando dependencias del árbol de componentes... > [HALLAZGO] Loop de renderizado detectado en hook personalizado.
C. Propuesta de Intervención (Diff Viewer): Si la IA sugiere cambiar código, se muestra un micro-diff elegante (líneas eliminadas con un indicador tenue, líneas nuevas resaltadas con el color del "destello" principal), permitiendo ver exactamente qué se va a alterar.
9.3. Controles de Decisión (El Veredicto Humano)
La zona interactiva en la base del panel, donde la máquina cede el control al administrador.

Botonera de Acción Táctica:
[ EJECUTAR MERGE ]: Botón primario sólido. Aprueba el Pull Request mediante la API de GitHub y lo manda a producción.
[ REBATIR SOLUCIÓN ]: Botón fantasma (ghost). Abre la interfaz del chat dialéctico para discutir alternativas con la IA.
[ PURGAR ENTORNO ]: Botón de advertencia sutil. Destruye la rama de prueba y descarta los cambios. Con esto, el panel queda como un verdadero puente de mando técnico. Entras, ves qué pensó la IA, ves el código que quiere cambiar, y tú tienes el gatillo en la mano.
## 10. El War Room (Sala de Debate Dialéctico)
## 10.1. Experiencia Inmersiva (UI/UX)
Inmersión Total: Al presionar "Rebatir Solución" en el panel lateral, la interfaz transiciona a un modo de pantalla completa (Focus Mode), bloqueando la navegación externa para garantizar cero distracciones.
Layout en Pantalla Dividida (Split Screen):
Panel Izquierdo (La Evidencia): Muestra la documentación cruda, enlaces de investigación de mercado, papers técnicos o el análisis del código que generó la IA.
Panel Derecho (La Fragua): La interfaz del chat dialéctico neo-minimalista donde ocurre la interacción humano-máquina.
## 10.2. Reglas de Interacción y Herramientas
Cero Botones de Decisión: Se elimina la botonera tradicional (Aceptar/Rechazar). El sistema utiliza Procesamiento de Lenguaje Natural (NLP). El administrador debe dar la instrucción explícita en el texto (ej. "Autorizado, ejecuta los cambios" o "Descartado, busca otro enfoque") para detonar el trigger en el backend.
Caja de Herramientas del Chat:
Carga de Archivos (Drag & Drop): Soporte para adjuntar imágenes de UI, videos de bugs grabados en pantalla (mp4), documentos y fragmentos de código.
Citado Contextual: Capacidad de sombrear/seleccionar cualquier texto del Panel Izquierdo (la documentación) o del historial del chat y utilizar un botón de "Citar" para referenciarlo directamente en el campo de texto de la nueva respuesta.
## 10.3. Protocolo de Ejecución por Palabras Clave (Trigger Keys)
Mecanismo Anti-Intrusos: Para evitar ejecuciones accidentales o manipulación por usuarios no autorizados que lleguen a la interfaz, el motor de NLP del agente tiene prohibido ejecutar acciones con comandos genéricos (ej. "sí", "acepto", "ok", "procede").
Llaves de Ejecución (Modismos): La comunicación con la API de GitHub o el control de la infraestructura cloud se dispara únicamente cuando el administrador teclea palabras clave conversacionales específicas dentro del flujo del texto.
Comando de Aprobación (Merge): Va que Va (El agente reconoce esta frase como la firma oficial para inyectar el código a producción).
Comando de Rechazo (Descarte): Darle cuello / Abortar misión (Destruye el entorno temporal y cierra el Pull Request).
Feedback Visual de Confirmación: Al detectar el trigger en el chat, el sistema detiene la generación de texto, ejecuta el "Destello" visual en la interfaz del War Room y muestra un log de terminal confirmando la acción del backend. 
## 11. Sistema de Documentación Automatizada (El Cerebro RAG)
## 11.1. Generación de Actas de Simbiosis
Cierre de Sesión: Una vez que el administrador da una orden final en el War Room, el Agente Historiador toma el control.
El Entregable: La IA redacta automáticamente un documento .md estructurado que contiene:
El hallazgo original (Qué disparó la sesión).
Resumen del debate (Argumentos a favor y en contra).
Archivos o contexto citado.
La resolución final (El prompt de autorización del humano).
## 11.2. Organización y Almacenamiento
Jerarquía de Datos: Los documentos se organizan lógicamente bajo el esquema Proyecto -> Iteraciones -> Sesión de Debate.
Inyección Vectorial: Este documento se convierte en embeddings (vectores) y se guarda en la Base de Datos Vectorial alojada en la nube (ej. Google Cloud Platform).
Recuperación: En futuras sesiones, si se toca un tema similar, la IA consulta esta base de datos y trae el contexto al instante, garantizando que no exista amnesia del proyecto. 
## 12. Ecosistema Multi-LLM y Gobernanza
## 12.1. Asignación de Motores por Rol
Fase de Vigilancia y Debate (Bajo Costo/Open Source): Utilización de modelos libres (ej. Llama 3 o Mixtral) optimizados para lectura de documentos, razonamiento verbal y generación de contexto. Operan el chat dialéctico y la investigación.
Fase de Generación de Código (Premium/Alta Precisión): Activación de modelos comerciales top-tier (ej. Claude 3.5 Sonnet o GPT-4o) pagados por consumo de tokens. Restringidos exclusivamente a la creación de Pull Requests tras la autorización humana.
## 12.2. El Juez de Hierro (Sistema de Veto Autónomo)
El Filtro de Seguridad: Antes de que cualquier código llegue al entorno de pruebas o genere un PR, pasa por un tercer agente (IA Evaluadora) con parámetros de temperatura 0.
Capacidad de Veto Absoluto: Esta IA tiene la orden estricta de rechazar el código si detecta:
Vulnerabilidades de seguridad (OWASP).
Degradación extrema de rendimiento (ej. renderizados infinitos en React).
Código huérfano o dependencias rotas.
Resolución de Conflictos: Si el Juez de Hierro veta un código, se cancela la acción de GitHub API y el reporte de fallo se envía directamente al War Room para que el administrador humano revise el conflicto. 
## 13. Inyección Dinámica de Contexto (El Cambiador de Cascos)
Para soportar múltiples aplicaciones con arquitecturas y lenguajes diametralmente opuestos, el Agente Ingeniero (Claude) no opera con un solo set de instrucciones. Su "Cerebro" se ensambla en tiempo real en milisegundos justo antes de abrir el War Room.
## 13.1. Ensamblaje del System Prompt
El backend de RZStudio compone la personalidad de la IA uniendo dos piezas clave:

El ADN Base (Fijo): El manifiesto inamovible de la empresa.
"Eres el Agente Ingeniero de RZStudio. Tu código debe ser estrictamente neo-minimalista, limpio y modular. Operas bajo el escrutinio de un Juez de Hierro."
El Manifiesto del Proyecto (Dinámico): La inyección específica de la app seleccionada en el Grid.
"CONTEXTO ACTUAL: Estás auditando 'Project Atlas'. Stack: React Three Fiber, Next.js 16. Regla crítica: Mantener 60 FPS en el renderizado 3D."
## 13.2. Asignación de Skills (Herramientas) a la Carta
Las habilidades de Claude mutan según la plataforma del proyecto:

Si el proyecto es Web: El backend le habilita los skills auditar_lighthouse() y analizar_bundle_size().
Si el proyecto es App Android: El backend oculta las herramientas web y le habilita leer_logcat() y analizar_consumo_bateria_apk().
Claude solo ve las herramientas que le sirven para el proyecto que tiene enfrente. De esta forma, tú no le dictas nada a mano cada vez que entras. El sistema detecta qué tarjeta pisaste en el Grid de "Simbiosis", lee el expediente de esa app, arma el paquete completo y se lo avienta a Claude antes de que tú digas "Hola".
## 13.3. Configuración como Código (.rz-manifest.json)
Implementación: La inyección de contexto no dependerá de interfaces externas ni bases de datos manuales. Se utilizará un archivo de configuración .rz-manifest.json alojado en la raíz del repositorio de cada proyecto.
Estructura de Datos: El archivo contendrá el stack tecnológico, las reglas críticas de negocio, los objetivos de rendimiento y la lista de herramientas (skills) autorizadas para el Agente Ingeniero en ese proyecto en particular.
Flujo de Ejecución:
El backend de RZStudio lee el manifiesto vía GitHub API.
Valida la estructura mediante un esquema estricto (Zod/TypeScript) para evitar fallos de inyección.
Ensambla el System Prompt y activa la sesión del Agente Ingeniero (Claude).
Beneficio Arquitectónico: Permite versionar el comportamiento de la IA junto con el código. Si el proyecto migra de React a Vue en el futuro, el desarrollador actualiza el manifiesto en el mismo commit, manteniendo la simbiosis perfectamente sincronizada

## 14. El Meta-Laboratorio (Dogfooding Arquitectónico)
El sistema de Simbiosis no solo audita proyectos externos; está diseñado para auditar, mantener y optimizar su propio código fuente (RZStudio.dev) de manera recursiva.
14.1. Auto-Inyección de Contexto
RZStudio.dev cuenta con su propio archivo .rz-manifest.json en la raíz del repositorio principal.
Tarjeta Cero: En el Grid del Laboratorio, el primer proyecto siempre será el estado en vivo de RZStudio. El administrador podrá ver en tiempo real si el Agente Historiador ha detectado mejores formas de optimizar la propia plataforma.
14.2. Blindaje de Auto-Destrucción (Nivel Meta)
Para evitar que una optimización fallida comprometa la plataforma que sostiene al laboratorio, las reglas del War Room para RZStudio.dev tienen restricciones adicionales:

Juez de Hierro Implacable: El umbral de tolerancia a fallos del Juez de Hierro se vuelve absoluto. Cualquier advertencia de linting o caída de un milisegundo en el rendimiento veta el Pull Request automáticamente.
Aislamiento de Infraestructura: Las pruebas en caliente (Preview Deployments) de la propia plataforma jamás comparten bases de datos o vectores con el entorno de producción real hasta la aprobación explícita humana mediante el trigger key Va que Va. Con esto, socio, RZStudio se vuelve un organismo vivo que se mejora a sí mismo con el paso del tiempo, y el código abierto vive en la nube sin desangrar tu presupuesto de infraestructura.
## 15. Ciclo de Vida y Estados de Proyecto (El Flujo Unificado)
El sistema RZStudio.dev gestiona dos canales de operación automatizada y un canal manual (On-Demand) a través del War Room.
## 15.1. Canal de Producción (Portafolio Activo)
Trigger: Basado en calendario (Cron Jobs del Historiador) o detección pasiva de errores en los logs.
Acción: Auditoría silenciosa. Si se detecta deuda técnica o mejoras en el mercado, se genera un reporte y el proyecto pasa a estado "Esperando Revisión" en el Grid.
Despliegue: Tras el debate y el comando Va que Va, el Pull Request se fusiona (Merge) y el pipeline CI/CD actualiza los servidores en vivo.
## 15.2. Canal de Pruebas (Sandbox / Beta)
Trigger: Eventos generados por el usuario final (Feedback de testers vía web o app Android).
Acción: La IA procesa los reportes de bugs o fricción de UX, diseña una solución y la presenta en el panel de diagnóstico.
Despliegue: Se compila un nuevo entorno temporal o un nuevo binario (APK) para iterar la prueba antes de su graduación a Producción.
## 15.3. Canal On-Demand (Solicitudes por Necesidad)
Trigger: Activación manual por parte del administrador de RZStudio.
Acción: El administrador invoca al Agente Ingeniero en el War Room para requerimientos de negocio nuevos (ej. integrar una nueva pasarela de pago, rediseñar un componente).
Flujo: La IA ejecuta la investigación pertinente, propone la arquitectura, y procede con la creación de la rama y el PR correspondiente bajo demanda. 
