# Resumen técnico de tratamiento de datos — RZStudio.dev

**Propósito de este documento:** describir con precisión técnica qué datos personales
recolecta la plataforma, de dónde vienen, cómo se procesan, para qué se usan, dónde se
resguardan y con qué seguridad — para que un abogado redacte el Aviso de Privacidad y
los Términos de Servicio definitivos con conocimiento exacto del sistema.

**Responsable:** RZStudio (Rodolfo) — contacto: rodolfog@rzstudio.dev
**Sitio:** https://rzstudio.dev — alojado en Google Cloud Run
**Fecha del resumen:** 11 de junio de 2026 (refleja el código en producción a esta fecha)

---

## 1. Inventario de datos recolectados (de dónde vienen)

### 1.1 Formulario de contacto (`/contacto`)
| Dato | Obligatorio | Origen |
|---|---|---|
| Nombre | Sí | Captura directa del visitante |
| Email | Sí | Captura directa |
| Mensaje libre | Sí | Captura directa |

*Estado actual:* el formulario está en proceso de conectarse a envío real por correo
(Resend) hacia rodolfog@rzstudio.dev y a almacenamiento en base de datos.

### 1.2 Registro de testers beta (laboratorio Simbiosis, modal "obtener binario seguro")
| Dato | Obligatorio | Origen |
|---|---|---|
| Nombre completo | Sí | Captura directa |
| Email | Sí | Captura directa |
| Perfil/rol (desarrollador, inversor, producto, curioso) | Sí | Selección del usuario |
| Dirección IP | Automático | Cabeceras HTTP del servidor |
| Fecha de registro | Automático | Servidor |

### 1.3 Ciclo de vida del token de prueba (APK Android)
| Dato | Origen |
|---|---|
| Identificador de token (UUID) vinculado al tester | Generado por el servidor |
| Fecha de primera activación de la app | Enviado por la app instalada (primer arranque) |
| Fecha del último "heartbeat" (la app valida su acceso en cada arranque) | App instalada |
| Estado del token (pendiente/activo/expirado/revocado) y renovaciones | Servidor |
| Marcas de correos enviados (aviso de expiración, seguimiento) | Servidor |

**Implicación relevante:** el heartbeat revela *cuándo* el tester abre la app
(patrón de uso temporal). No se recolecta ningún otro dato del dispositivo:
ni modelo, ni ubicación, ni contactos, ni identificadores de publicidad.

### 1.4 Chat público con IA (`/ia`)
- El **contenido de los mensajes** que el visitante escribe se envía a la API de
  Anthropic (EE. UU.) para generar la respuesta. **No almacenamos las conversaciones**
  en nuestros servidores; solo registramos conteos de tokens consumidos (números, sin contenido).
- La IP del visitante se usa en memoria para limitar la frecuencia de mensajes
  (anti-abuso); ese registro es efímero y se borra al reiniciar el servicio.

### 1.5 Panel de administración
- Cookie de sesión firmada (HMAC-SHA256), httpOnly, vigencia 8 horas. Solo para el administrador.
- Intentos de login limitados por IP (anti fuerza bruta).

### 1.6 Datos que NO recolectamos
- Sin cookies de rastreo ni analítica de terceros (a la fecha no hay Google Analytics ni píxeles)
- Sin datos de pago
- Sin datos sensibles (salud, biometría, etc.)
- Sin acceso a contactos, ubicación o archivos del dispositivo del tester

---

## 2. Cómo se procesan

1. **Contacto:** el mensaje se reenvía por correo al responsable y se almacena como
   prospecto comercial.
2. **Testers:** el registro genera un token de descarga (válido 24 h) y un periodo de
   prueba de 30 días que inicia con el primer arranque de la app. El sistema procesa
   los datos para: control de acceso al binario, avisos de expiración, seguimiento de
   feedback a las 48 h, y renovación/revocación por el administrador.
3. **IA:** los mensajes del chat público y las sesiones técnicas del administrador se
   procesan mediante modelos de lenguaje de terceros (ver §4 encargados).
4. **Decisiones automatizadas:** ninguna decisión con efectos jurídicos sobre el
   usuario se toma de forma automatizada. (El "Juez de Hierro" evalúa código, no personas.)

## 3. Uso que damos a los datos

| Uso | Base de datos involucrada |
|---|---|
| Responder solicitudes de contacto | Prospectos de contacto |
| Otorgar y controlar acceso al programa beta | Testers + tokens |
| Comunicaciones operativas del beta (expiración, seguimiento 48 h) | Testers + tokens |
| Prospección comercial propia (los testers son leads calificados) | Testers |
| Métricas agregadas de consumo de IA (sin contenido personal) | Logs de uso |

**No vendemos ni compartimos datos con terceros para sus fines propios.**
Los terceros listados abajo actúan únicamente como encargados/procesadores.

## 4. Encargados de tratamiento (terceros que tocan los datos)

| Proveedor | Qué procesa | Ubicación | Rol |
|---|---|---|---|
| Google Cloud (Cloud Run, almacenamiento) | Toda la plataforma y sus datos | EE. UU. / región configurada | Infraestructura |
| Anthropic (API de Claude) | Contenido de mensajes de chat y sesiones técnicas | EE. UU. | Procesador de IA |
| Google (API de Gemini, como respaldo) | Mismo contenido cuando el modelo principal no está disponible | EE. UU. | Procesador de IA (planificado) |
| Resend | Email del destinatario y contenido de correos transaccionales | EE. UU. | Envío de correo (planificado) |
| GitHub | Solo código fuente; sin datos personales de usuarios | EE. UU. | Control de versiones |

**Transferencia internacional:** los datos se procesan en EE. UU. — el abogado debe
cubrir la cláusula de transferencias (LFPDPPP art. 36-37 / GDPR cap. V si aplica a europeos).

## 5. Dónde se resguardan

- **Hoy:** archivos JSON en el contenedor de Cloud Run; en migración a **Google Cloud
  Firestore** (base de datos gestionada) + **Google Cloud Storage** (binarios APK).
- Región del proyecto GCP: [completar — verificar en consola].
- Periodo de retención: **no definido aún** → punto a definir con el abogado.
  Propuesta técnica: prospectos 24 meses; testers y tokens 12 meses tras expiración;
  logs de consumo 12 meses.

## 6. Seguridad implementada (estado real, verificado)

- Tráfico 100% HTTPS (TLS gestionado por Cloud Run)
- Sesiones admin con firma HMAC-SHA256, cookie httpOnly + sameSite strict
- Comparación de contraseña en tiempo constante (anti timing-attack)
- Límite de intentos de login: 5/minuto por IP
- Límite del chat público: 10 mensajes/minuto por IP + tope diario de consumo
- Endpoints administrativos rechazan toda petición sin sesión válida (verificado 401)
- Secretos fuera del repositorio (variables de entorno de Cloud Run)
- Tokens de tester: UUID v4 no adivinables; revocables por el administrador
- Pendiente (en plan): cifrado de respaldos y política de retención automatizada

## 7. Derechos de los titulares (para que el abogado redacte el procedimiento)

- Canal de ejercicio de derechos ARCO / GDPR: **rodolfog@rzstudio.dev**
- Capacidad técnica ya existente: el administrador puede consultar, corregir y
  eliminar registros de testers y prospectos, y revocar tokens de acceso.
- Falta definir: plazo de respuesta comprometido y formato de acreditación de identidad.

## 8. Puntos abiertos que requieren criterio legal

1. Jurisdicción y ley aplicable (México / LFPDPPP como base; ¿usuarios UE → GDPR?)
2. Edad mínima de uso (propuesta: 18 años para el programa beta)
3. Periodos de retención definitivos (propuesta técnica en §5)
4. Limitación de responsabilidad por binarios beta instalados en dispositivos del tester
5. Cláusula de transferencias internacionales (EE. UU.)
6. Si el seguimiento comercial a testers requiere consentimiento separado del operativo
