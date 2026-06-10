// El Juez de Hierro (doc §12.2) — IA evaluadora con temperatura 0 y veto absoluto.
// Evalúa toda propuesta de código ANTES de cualquier merge. Si veta, la acción
// de GitHub se cancela y el reporte llega al War Room.

import { getActiveKey } from "./runtime-key";
import { recordUsage } from "./usage";
import { logAppend, logTail } from "./db";
import type { RzManifest } from "./manifest";

const JUDGE_COL   = "judge_log";
const JUDGE_MODEL = "claude-haiku-4-5";

export interface JudgeVerdict {
  approved: boolean;
  reasons:  string[];
  raw:      string;
}

export interface JudgeLogEntry {
  ts:        string;
  projectId: string;
  approved:  boolean;
  reasons:   string[];
}

const JUDGE_SYSTEM = `Eres el Juez de Hierro de RZStudio: un evaluador de código implacable con capacidad de veto absoluto. Tu única función es decidir si un cambio de código propuesto es seguro para producción.

VETAS OBLIGATORIAMENTE si detectas:
1. Vulnerabilidades de seguridad (OWASP top 10: inyección, XSS, secretos expuestos, auth rota, etc.)
2. Degradación extrema de rendimiento (loops de renderizado, N+1, bloqueo del hilo principal)
3. Código huérfano o dependencias rotas (imports inexistentes, funciones no definidas)

Respondes EXCLUSIVAMENTE con JSON válido, sin markdown, con esta forma exacta:
{"approved": true|false, "reasons": ["razón 1", "razón 2"]}

Si apruebas, reasons explica brevemente por qué es seguro. Si vetas, reasons lista cada problema encontrado. Ante la duda, VETA — un falso negativo cuesta más que un falso positivo.`;

export async function judgeCode(
  projectId: string,
  proposal:  string,
  manifest:  RzManifest | null,
): Promise<JudgeVerdict> {
  const apiKey = getActiveKey();
  if (!apiKey) {
    return { approved: false, reasons: ["juez de hierro sin conexión a anthropic — veto por defecto"], raw: "" };
  }

  const thresholds = manifest
    ? `\nUmbrales adicionales del proyecto: caída lighthouse máx ${manifest.iron_judge_thresholds.lighthouse_score_drop_max} pts, bundle +${manifest.iron_judge_thresholds.bundle_size_increase_max_kb}kb máx, ${manifest.iron_judge_thresholds.linting_errors_allowed} errores de linting permitidos.${projectId === "00" ? " ESTE ES EL META-LABORATORIO: tolerancia ABSOLUTA, cualquier duda mínima es veto." : ""}`
    : "";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:       JUDGE_MODEL,
      max_tokens:  512,
      temperature: 0,
      system:      JUDGE_SYSTEM + thresholds,
      messages: [{
        role:    "user",
        content: `Evalúa esta propuesta de cambio para el proyecto "${projectId}":\n\n${proposal.slice(0, 8000)}`,
      }],
    }),
  });

  if (!res.ok) {
    const verdict: JudgeVerdict = {
      approved: false,
      reasons:  [`el juez no pudo evaluar (anthropic ${res.status}) — veto por defecto`],
      raw:      "",
    };
    await logVerdict(projectId, verdict);
    return verdict;
  }

  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";

  await recordUsage({
    projectId,
    agent:        "juez",
    model:        JUDGE_MODEL,
    inputTokens:  data?.usage?.input_tokens  ?? 0,
    outputTokens: data?.usage?.output_tokens ?? 0,
  });

  let verdict: JudgeVerdict;
  try {
    // Extrae el primer objeto JSON aunque el modelo agregue texto o fences alrededor
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("sin JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    verdict = {
      approved: parsed.approved === true,
      reasons:  Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      raw:      text,
    };
  } catch {
    verdict = { approved: false, reasons: ["respuesta del juez ilegible — veto por defecto"], raw: text.slice(0, 300) };
  }

  await logVerdict(projectId, verdict);
  return verdict;
}

async function logVerdict(projectId: string, v: JudgeVerdict): Promise<void> {
  await logAppend(JUDGE_COL, {
    ts: new Date().toISOString(),
    projectId,
    approved: v.approved,
    reasons:  v.reasons,
  } satisfies JudgeLogEntry);
}

export async function getJudgeLog(limit = 50): Promise<JudgeLogEntry[]> {
  return logTail<JudgeLogEntry>(JUDGE_COL, limit);
}
