// Sistema de Inyección Dinámica de Contexto — "El Cambiador de Cascos" (doc §13)
// Cada proyecto tiene un .rz-manifest.json. El system prompt del Agente Ingeniero
// se ensambla en tiempo real: ADN base de RZStudio + manifiesto del proyecto.

import fs from "node:fs";
import path from "node:path";
import { toToon } from "./toon";

// ─── Schema ───────────────────────────────────────────────────────────────────

export interface ShowcaseFeature { icon: string; title: string; detail: string }
export interface ShowcaseStep    { step: number; title: string; description: string }

export interface Showcase {
  tagline:     string;
  description: string;
  type:        "web" | "android" | "both";
  features:    ShowcaseFeature[];
  benefits:    string[];
  how_to_use:  ShowcaseStep[];
}

export interface IronJudgeThresholds {
  lighthouse_score_drop_max:   number;
  bundle_size_increase_max_kb: number;
  linting_errors_allowed:      number;
  linting_warnings_allowed:    number;
}

export interface RzManifest {
  manifest_version: string;
  project_id:       string;
  name:             string;
  stack:            string[];
  critical_rules:   string[];
  authorized_skills: string[];
  repo?:            { owner: string; name: string; default_branch: string } | null;
  testing?: {
    apk_lifetime_days:          number;
    download_link_expiry_hours: number;
    renewal_enabled:            boolean;
    max_renewals_per_tester:    number;
  };
  iron_judge_thresholds: IronJudgeThresholds;
  budget: {
    tokens_monthly:      number;
    alert_threshold_pct: number;
  };
  showcase: Showcase;
}

// ─── Validación (estricta, sin dependencias externas) ────────────────────────

function fail(field: string): never {
  throw new Error(`manifiesto inválido — campo faltante o mal tipado: ${field}`);
}

export function validateManifest(raw: unknown): RzManifest {
  const m = raw as Record<string, unknown>;
  if (typeof m !== "object" || m === null)               fail("(root)");
  if (typeof m.manifest_version !== "string")            fail("manifest_version");
  if (typeof m.project_id !== "string" || !m.project_id) fail("project_id");
  if (typeof m.name !== "string")                        fail("name");
  if (!Array.isArray(m.stack))                           fail("stack");
  if (!Array.isArray(m.critical_rules))                  fail("critical_rules");
  if (!Array.isArray(m.authorized_skills))               fail("authorized_skills");

  const judge = m.iron_judge_thresholds as Record<string, unknown>;
  if (typeof judge !== "object" || judge === null)       fail("iron_judge_thresholds");
  for (const k of ["lighthouse_score_drop_max", "bundle_size_increase_max_kb", "linting_errors_allowed", "linting_warnings_allowed"]) {
    if (typeof judge[k] !== "number") fail(`iron_judge_thresholds.${k}`);
  }

  const budget = m.budget as Record<string, unknown>;
  if (typeof budget !== "object" || budget === null)     fail("budget");
  if (typeof budget.tokens_monthly !== "number")         fail("budget.tokens_monthly");
  if (typeof budget.alert_threshold_pct !== "number")    fail("budget.alert_threshold_pct");

  const sc = m.showcase as Record<string, unknown>;
  if (typeof sc !== "object" || sc === null)             fail("showcase");
  if (typeof sc.tagline !== "string")                    fail("showcase.tagline");
  if (typeof sc.description !== "string")                fail("showcase.description");
  if (!["web", "android", "both"].includes(sc.type as string)) fail("showcase.type");
  if (!Array.isArray(sc.features))                       fail("showcase.features");
  if (!Array.isArray(sc.benefits))                       fail("showcase.benefits");
  if (!Array.isArray(sc.how_to_use))                     fail("showcase.how_to_use");

  return raw as RzManifest;
}

// ─── Carga ────────────────────────────────────────────────────────────────────

const MANIFESTS_DIR = path.join(process.cwd(), "manifests");
const ROOT_MANIFEST = path.join(process.cwd(), ".rz-manifest.json");

/** projectId "00" = RZStudio.dev (Tarjeta Cero, meta-laboratorio) — lee el manifiesto raíz. */
export function loadManifest(projectId: string): RzManifest | null {
  const file = projectId === "00"
    ? ROOT_MANIFEST
    : path.join(MANIFESTS_DIR, `${projectId}.json`);
  try {
    return validateManifest(JSON.parse(fs.readFileSync(file, "utf-8")));
  } catch {
    return null;
  }
}

export function listManifests(): RzManifest[] {
  const out: RzManifest[] = [];
  const root = loadManifest("00");
  if (root) out.push(root);
  try {
    for (const f of fs.readdirSync(MANIFESTS_DIR)) {
      if (!f.endsWith(".json")) continue;
      const m = loadManifest(f.replace(/\.json$/, ""));
      if (m) out.push(m);
    }
  } catch { /* sin directorio de manifiestos */ }
  return out;
}

/** Subconjunto público — lo único que se expone al visitante (no filtra reglas ni presupuesto). */
export function publicShowcase(projectId: string): (Showcase & { name: string }) | null {
  const m = loadManifest(projectId);
  return m ? { name: m.name, ...m.showcase } : null;
}

// ─── Ensamblaje del System Prompt (Cambiador de Cascos) ──────────────────────

const ADN_BASE = `Eres el Agente Ingeniero de RZStudio. Tu código debe ser estrictamente neo-minimalista, limpio y modular. Operas bajo el escrutinio de un Juez de Hierro que vetará cualquier código con vulnerabilidades de seguridad, degradación de rendimiento o dependencias rotas.

Reglas de operación:
- Hablas en español, tono técnico directo, estilo terminal (minúsculas cuando sea natural).
- Presentas hallazgos y propuestas con justificación técnica medible.
- NUNCA ejecutas acciones de infraestructura por tu cuenta. Las acciones (merge, purga) solo las dispara el administrador con las llaves de ejecución exactas.
- Si el administrador escribe "Va que Va" el backend ejecuta el merge. Si escribe "Darle cuello" o "Abortar misión" el backend purga el entorno. Tú no simulas estos efectos: el sistema los ejecuta y te informa.
- El proyecto es metaestable: si el debate revela que la propuesta es mala, lo dices sin rodeos y recomiendas el descarte.`;

/** Es el meta-laboratorio: restricciones adicionales si el proyecto es RZStudio mismo (doc §14.2). */
const META_SHIELD = `
BLINDAJE META-LABORATORIO: Estás auditando la propia plataforma RZStudio.dev que te aloja. El umbral de tolerancia del Juez de Hierro es ABSOLUTO: cualquier advertencia de linting o degradación de rendimiento veta el cambio. Sé extremadamente conservador.`;

export function assembleSystemPrompt(projectId: string): { prompt: string; manifest: RzManifest | null } {
  const manifest = loadManifest(projectId);

  if (!manifest) {
    return {
      prompt: `${ADN_BASE}\n\nCONTEXTO ACTUAL: Proyecto "${projectId}" sin manifiesto registrado. Solo puedes debatir en términos generales; no hay reglas críticas ni skills autorizadas cargadas.`,
      manifest: null,
    };
  }

  // Contexto del proyecto en TOON (ADR 11/06/2026 — formato denso para el modelo)
  const dynamic = `
CONTEXTO ACTUAL — estás auditando '${manifest.name}':
${toToon({
    proyecto:          manifest.project_id,
    stack:             manifest.stack,
    reglas_criticas:   manifest.critical_rules,
    skills_autorizadas: manifest.authorized_skills,
    umbrales_juez:     manifest.iron_judge_thresholds,
    presupuesto_tokens_mes: manifest.budget.tokens_monthly,
  })}
No ofrezcas análisis que requieran herramientas fuera de skills_autorizadas.`;

  return {
    prompt: ADN_BASE + (projectId === "00" ? META_SHIELD : "") + "\n" + dynamic,
    manifest,
  };
}

// ─── Llaves de Ejecución (Trigger Keys, doc §10.3) ───────────────────────────

export type TriggerAction = "merge" | "purge" | null;

/** Detección server-side de las llaves de ejecución. Comandos genéricos (sí, ok, procede) NO disparan nada. */
export function detectTrigger(text: string): TriggerAction {
  const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/\bva\s+que\s+va\b/.test(t)) return "merge";
  if (/\bdarle\s+cuello\b/.test(t) || /\babortar\s+mision\b/.test(t)) return "purge";
  return null;
}
