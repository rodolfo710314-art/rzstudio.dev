❌ LO QUE FALTA CONSTRUIR
Organizado por prioridad de dependencia (lo que bloquea a lo demás primero):

BLOQUE 1 — Base de Datos y Backend Core
1.1 Schema de Supabase/PostgreSQL


Tablas:
├── projects          (id, slug, name, stack, manifest_url, created_at)
├── testers           (id, email, name, role, created_at)
├── build_tokens      (token, project_id, tester_id, status, lifetime_days,
│                      download_url_expires_at, first_activated_at,
│                      expires_at, last_heartbeat_at, renewal_count)
├── war_room_sessions (id, project_id, agent_version, transcript, resolution,
│                      trigger_key_used, created_at, closed_at)
└── audit_reports     (id, project_id, session_id, md_content, embedding_id)
1.2 API Routes (Next.js) — APK Token System


POST /api/v1/testers/register     → crea tester + build_token + URL presignada
GET  /api/v1/build/validate?t=   → heartbeat de la app Android (retorna status + días restantes)
POST /api/v1/build/revoke         → admin revoca token
POST /api/v1/build/extend         → admin extiende expiración
GET  /api/v1/build/tokens         → admin lista todos los tokens por proyecto
BLOQUE 2 — .rz-manifest.json por Proyecto
Schema completo con todos los campos necesarios, incluyendo la nueva sección showcase:


{
  "manifest_version": "1.0",
  "project_id": "project-atlas",
  "stack": ["Next.js 16", "React Three Fiber", "TypeScript"],
  "critical_rules": ["Mantener 60 FPS en renderizado 3D"],
  "authorized_skills": ["auditar_lighthouse", "analizar_bundle_size"],

  "testing": {
    "apk_lifetime_days": 30,
    "download_link_expiry_hours": 24,
    "grace_period_offline_hours": 48,
    "expiry_action": "block",
    "renewal_enabled": true,
    "max_renewals_per_tester": 2,
    "notifications": {
      "warning_days_before": 5,
      "channels": ["email", "in_app_toast"]
    }
  },

  "iron_judge_thresholds": {
    "lighthouse_score_drop_max": 5,
    "bundle_size_increase_max_kb": 20,
    "linting_errors_allowed": 0,
    "linting_warnings_allowed": 3
  },

  "budget": {
    "tokens_monthly": 500000,
    "fallback_model": "llama3-70b",
    "alert_threshold_pct": 80
  },

  "showcase": {
    "tagline": "Visualización 3D de arquitecturas neuronales en tiempo real",
    "description": "Descripción completa del propósito del proyecto...",
    "type": "web",
    "features": [
      { "icon": "Cpu", "title": "Render adaptativo", "detail": "Se ajusta a tu hardware automáticamente" },
      { "icon": "Zap", "title": "60 FPS constante", "detail": "Sin degradación en dispositivos mid-range" }
    ],
    "benefits": [
      "Reduce tiempo de carga en 40% vs soluciones equivalentes",
      "Compatible con todos los Tiers de hardware"
    ],
    "how_to_use": [
      { "step": 1, "title": "Abre el sandbox", "description": "Haz clic en 'Iniciar Entorno de Prueba'" },
      { "step": 2, "title": "Interactúa con la red", "description": "Arrastra los nodos para reconfigurar la topología" },
      { "step": 3, "title": "Reporta al agente", "description": "Usa el panel lateral para enviar feedback directo" }
    ],
    "screenshots": []
  }
}
BLOQUE 3 — Nuevo Componente: ProjectShowcase
La nueva pantalla de información por app (requisito nuevo). Se activa antes del sandbox o descarga, mostrando features, beneficios y guía de uso dentro de la UI de RZStudio.


[Clic en tarjeta del Grid]
          │
          ▼
[ProjectShowcase Panel — pantalla completa o modal wide]
          │
    ┌─────┴──────────────────────────────┐
    │  LEFT                RIGHT          │
    │  ─────────            ─────────     │
    │  Tagline              Features      │
    │  Description          (con íconos) │
    │                                     │
    │  Benefits grid        How to Use   │
    │  (checkmarks)         (steps       │
    │                        numerados)  │
    │                                     │
    │  ─────────────────────────────────  │
    │  [Iniciar Entorno] ó [Obtener APK] │
    └────────────────────────────────────┘
Datos servidos directamente desde el campo showcase del .rz-manifest.json de cada proyecto.

## BLOQUE 4 — Sistema APK Completo (Android)
Componente	Descripción
StartupValidator.kt	Corre en Application.onCreate(), llama /api/v1/build/validate
TokenStorage.kt	EncryptedSharedPreferences para guardar el token de forma segura
ExpiryBlockScreen.kt	Pantalla de bloqueo con CTA de feedback y renovación
ExpiryWarningToast.kt	Toast persistente cuando faltan ≤5 días
FeedbackTrigger.kt	Shake-to-report (umbral configurable desde manifest)
Deep link receiver	rzstudio.dev/activate?t={token} → activa la app en primer arranque
## BLOQUE 5 — Mejoras UX (eliminando puntos de fricción)
Punto de fricción	Solución	Componente nuevo
Trigger keys sin segunda validación	Modal de confirmación con countdown 5s	TriggerConfirmModal.tsx
Telemetría pública expone estado interno	Separar vistas public/admin en Ticker.tsx	Modificar Ticker.tsx
Lead capture bloquea testers serios	Descarga libre + registro para entorno cerrado	Refactor AndroidModal.tsx
Juez de Hierro sin thresholds	Leer umbrales desde iron_judge_thresholds en manifest	IronJudgeService.ts
Entornos temporales sin TTL	Cron que destruye preview deployments tras 72h inactivos	Cron job backend
TTL de APK ambiguo	Reloj empieza en primer arranque, no en descarga	StartupValidator.kt
## BLOQUE 6 — Integraciones Externas
Integración	Propósito	Estado
GitHub API	Crear ramas, PRs, merge, revoke	❌ No implementado
Supabase	Base de datos + auth admin	❌ No implementado
Email (Resend)	Follow-up 48h, warning 5 días, activación token	❌ No implementado
Cloud Storage (GCP/AWS S3)	Almacenamiento de APKs + presigned URLs	❌ No implementado
Vector DB (pgvector o Pinecone)	RAG + memoria a largo plazo de sesiones	❌ No implementado
Cron jobs (Vercel Cron)	Vigilancia de mercado, expiración de tokens, TTL de entornos	❌ No implementado
## BLOQUE 7 — Multi-LLM y Agentes Reales
Agente	Rol	Modelo	Estado
Agente Historiador	Vigilancia de mercado, crons 7/15/30 días	Llama 3 / Mixtral	❌ No implementado
Agente Ingeniero	Generación de código, PRs	Claude Sonnet 4.6	✅ Base existe (solo chat)
Juez de Hierro	Evaluador de seguridad, temperatura 0	Claude Haiku 4.5	❌ No implementado
Agente Debate	War Room dialéctico	Llama 3 (bajo costo)	❌ Simulado en WarRoom.tsx
Cost Governor	Monitor de tokens por proyecto	Logic propia	❌ No implementado
## BLOQUE 8 — Dashboard Admin (Panel Simbiótico Real)
Sección	Descripción
Tester Registry	Lista de tokens activos por proyecto, extend/revoke
Build Pipeline	Estado de PRs abiertos, ramas activas, entornos temporales
War Room History	Historial de sesiones cerradas con su Acta Simbiosis
Cost Monitor	Tokens consumidos vs presupuesto por proyecto y mes
Iron Judge Log	Vetos emitidos, razón, proyecto afectado
Hoja de Ruta de Construcción

Semana 1-2  │ Bloque 1: DB schema + API Routes APK tokens
Semana 3    │ Bloque 2: .rz-manifest.json (schema Zod + primer proyecto)
Semana 4    │ Bloque 3: ProjectShowcase component (nuevo requisito)
Semana 5-6  │ Bloque 4: Android APK con StartupValidator + pantallas de expiración
Semana 7    │ Bloque 5: Mejoras UX (TriggerConfirmModal, Ticker público/privado)
Semana 8-9  │ Bloque 6: Integraciones externas (GitHub API, Resend, Storage)
Semana 10+  │ Bloque 7-8: Multi-LLM real + Dashboard admin

