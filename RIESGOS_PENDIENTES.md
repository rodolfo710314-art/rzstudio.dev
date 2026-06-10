# Riesgos pendientes — Simbiosis

Checklist derivado del análisis de riesgos del 10/06/2026.
**Regla de trabajo:** al planear cualquier modificación del sistema, revisar esta lista
e incluir al menos un pendiente relacionado con el área que se toca.

## ✅ Resueltos (10/06/2026)

- [x] **#1** Rate limit por IP en `/api/chat` (10 msg/min) + registro en Cost Governor + tope diario `RZ_CHAT_DAILY_TOKEN_CAP` (default 150k tokens/día → degrada a modo demo)
- [x] **#3** Anti fuerza bruta en login admin (5 intentos/min por IP)
- [x] **#4** Ruta de diagnóstico `/api/admin/env-check` eliminada

## 🔴 Pendientes — alta prioridad

- [ ] **#2a Cloud Run a una sola instancia** (config, no código — aplicar YA en consola):
  ```
  gcloud run services update SERVICIO --max-instances=1
  ```
  Sin esto, el storage JSON sufre condiciones de carrera entre instancias.
- [ ] **#2b Migrar storage JSON → Firestore o Supabase** (Bloque 1 del documento original).
  Elimina las condiciones de carrera de raíz y permite escalar a 2+ instancias.
  Afecta: `src/lib/jstore.ts`, `apk-store.ts`, `actas.ts`, `usage.ts`, `iron-judge.ts`, `rate-limit.ts`.

## 🟠 Pendientes — media prioridad

- [ ] **#6 Streaming en descargas de APK** — `fs.readFileSync` carga el binario completo en RAM
  (`/api/v1/build/download` y `/api/admin/apk/file`). Con APKs grandes + concurrencia puede
  tumbar la instancia. Sustituir por `ReadableStream`.
- [ ] **#7 Verificar firma del APK en el upload** — el modal promete "binario firmado con clave
  rz-studio-2026" pero nada lo valida. Integrar verificación de certificado (`apksigner verify`)
  en `/api/admin/apk` POST.
- [ ] **#8 GitHub: el agente solo debe ABRIR PRs, no fusionarlos** — mientras no haya branch
  protection con revisión humana obligatoria en el repo destino, cambiar `mergeAiPr` para que
  el "va que va" apruebe el PR pero el merge final sea manual en GitHub.
- [ ] **#9 Consentimiento de datos en captura de leads** — checkbox + aviso de privacidad en
  `AndroidModal` (se guarda nombre, email, rol e IP — obligación GDPR/LFPDPPP).

## 🟡 Pendientes — baja prioridad

- [ ] **#11 Rotación de logs JSONL** — `usage-log.jsonl` e `iron-judge-log.jsonl` crecen sin
  límite; archivar por mes en el cron de mantenimiento.
- [ ] **#12 Presupuesto propio para el Juez de Hierro** — hoy comparte el budget del proyecto.
- [ ] **#5 Telemetría del juez** — monitorear frecuencia de "respuesta ilegible → veto por
  defecto"; si es alta, endurecer el prompt o usar structured outputs.
- [ ] **Rate limiter distribuido** — el actual es en memoria (válido solo con max-instances=1);
  al migrar a multi-instancia moverlo a Firestore/Redis junto con #2b.

## Bloques del documento original aún no construidos

- [ ] **Agente Historiador** — cron de vigilancia de mercado (7/15/30 días) con web search
- [ ] **Base vectorial para RAG** — hoy la memoria de actas es recuperación local de las últimas 3
- [ ] **Entornos desechables (preview deployments)** con TTL de 72h
- [ ] **Webhook de feedback in-app** — el shake-to-report de Android necesita su endpoint receptor
- [ ] **Citado contextual y drag & drop** de archivos en el War Room (doc §10.2)
