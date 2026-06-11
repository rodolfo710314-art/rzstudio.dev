# Riesgos pendientes — Simbiosis

Checklist derivado del análisis de riesgos del 10/06/2026.
**Regla de trabajo:** al planear cualquier modificación del sistema, revisar esta lista
e incluir al menos un pendiente relacionado con el área que se toca.

## ✅ Resueltos

- [x] **#1** Rate limit por IP en `/api/chat` (10 msg/min) + registro en Cost Governor + tope diario `RZ_CHAT_DAILY_TOKEN_CAP` (default 150k tokens/día → degrada a modo demo) — 10/06/2026
- [x] **#3** Anti fuerza bruta en login admin (5 intentos/min por IP) — 10/06/2026
- [x] **#4** Ruta de diagnóstico `/api/admin/env-check` eliminada — 10/06/2026
- [x] **#9** Consentimiento de datos: checkbox + enlaces a `/legal/privacidad` y `/legal/terminos` en AndroidModal y formulario de contacto, validado también server-side — 11/06/2026 (textos legales en borrador, pendiente VoBo de abogado)
- [x] **#2a/#2b** Migración a Firestore + GCS con doble driver (`RZ_STORAGE` / `RZ_GCS_BUCKET`): testers, tokens, apk_meta, actas, usage, judge_log y contact-leads. Dev local sigue en JSON. — 11/06/2026 (falta activar en Cloud Run: ver #2c)

## 🔴 Pendientes — alta prioridad

- [ ] **#2c Activar Firestore en Cloud Run** (el código ya está, falta la config):
  1. Rol a la service account: `roles/datastore.user`
  2. Bucket: `gcloud storage buckets create gs://rzstudio-apks --location=us-west1` + `roles/storage.objectAdmin`
  3. Variables: `RZ_STORAGE=firestore` y `RZ_GCS_BUCKET=rzstudio-apks`
  4. Mantener `--max-instances=1` SOLO por el rate limiter en memoria (ver abajo);
     los datos ya no sufren condiciones de carrera.

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
- [ ] **#9b VoBo legal** — los textos de `/legal/*` son borradores base; sustituirlos por la
  redacción validada por el abogado (insumos en `legal/RESUMEN_DATOS_PARA_ABOGADO.md`).

## 🟠 Pendientes — Fase C (activación en producción)

- [ ] **#C1 Habilitar Vertex AI** para el fallback Gemini:
  ```
  gcloud services enable aiplatform.googleapis.com
  gcloud projects add-iam-policy-binding rzstudio-bcd94 \
    --member="serviceAccount:406401048480-compute@developer.gserviceaccount.com" \
    --role="roles/aiplatform.user"
  ```
- [ ] **#C2 Validar el ID del modelo Gemini** — configurado `GEMINI_MODEL=gemini-3.1-pro`
  (default del código). Si Vertex responde 404 al primer fallback, ajustar la variable
  al ID disponible en la consola de Vertex AI → Model Garden.
- [ ] **#C3 Probar el fallback real** — forzarlo una vez (desconectar la key de Anthropic
  desde el panel admin y mandar un mensaje al war room) y verificar que el acta registre
  el motor gemini.

## 🟠 Pendientes — control de costos por fase (aprobado 11/06/2026)

- [ ] **#F1 Cupo de testers por fase** — campo `testing.max_testers` en el `.rz-manifest.json`
  de cada proyecto; el registro rechaza con "cupo de la fase lleno" al alcanzarlo
  (el interesado queda como lead). Cupo versionado en git junto al código.
- [ ] **#F2 Tope de descargas por token** — máx. 3 descargas por token (cubre reintentos
  de conexión, corta el abuso). Registrar contador de descargas en el token.
- [ ] **#F3 Indicadores de cupo** — dashboard: "cupo: 14/20" por proyecto; modal público:
  "quedan N lugares en esta fase".
  Acotamiento resultante (fase de 20 testers, APK 1.5 GB): máx. ~$10.80 USD de egreso.

## ✅ Higiene de infraestructura

- [x] **Vercel desconectado** del repo (11/06/2026) — había un pipeline fantasma
  paralelo a Cloud Build; esa versión Vercel estaba rota (sin service account de
  GCP → sin Firestore/GCS/Vertex). El dominio rzstudio.dev siempre lo sirvió
  Cloud Run (`server: Google Frontend`). Ahora solo Cloud Run despliega.

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
