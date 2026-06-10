// Cost Governor — registro de tokens consumidos por proyecto y agente (doc §7 Bloque 7).
// Cada llamada a la API de Anthropic se registra aquí; el dashboard muestra
// consumo vs presupuesto mensual del manifiesto.

import { dataFile, appendLog, readLog } from "./jstore";
import { loadManifest } from "./manifest";

const USAGE_FILE = dataFile("usage-log.jsonl");

export interface UsageEntry {
  ts:           string;
  projectId:    string;
  agent:        "ingeniero" | "juez" | "chat" | "historiador";
  model:        string;
  inputTokens:  number;
  outputTokens: number;
}

export function recordUsage(entry: Omit<UsageEntry, "ts">) {
  appendLog(USAGE_FILE, { ts: new Date().toISOString(), ...entry });
}

export interface ProjectUsage {
  projectId:      string;
  totalTokens:    number;
  inputTokens:    number;
  outputTokens:   number;
  budgetMonthly:  number | null;
  pctUsed:        number | null;
  alert:          boolean;
}

/** Consumo del mes en curso, agrupado por proyecto. */
export function getMonthlyUsage(): ProjectUsage[] {
  const now   = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const all   = readLog<UsageEntry>(USAGE_FILE, 50_000).filter((e) => e.ts.startsWith(month));

  const byProject = new Map<string, { input: number; output: number }>();
  for (const e of all) {
    const cur = byProject.get(e.projectId) ?? { input: 0, output: 0 };
    cur.input  += e.inputTokens;
    cur.output += e.outputTokens;
    byProject.set(e.projectId, cur);
  }

  return [...byProject.entries()].map(([projectId, { input, output }]) => {
    const manifest = loadManifest(projectId);
    const budget   = manifest?.budget.tokens_monthly ?? null;
    const total    = input + output;
    const pct      = budget ? Math.round((total / budget) * 100) : null;
    return {
      projectId,
      totalTokens:   total,
      inputTokens:   input,
      outputTokens:  output,
      budgetMonthly: budget,
      pctUsed:       pct,
      alert:         pct !== null && manifest !== null && pct >= manifest.budget.alert_threshold_pct,
    };
  }).sort((a, b) => b.totalTokens - a.totalTokens);
}

/** True si el proyecto agotó su presupuesto mensual — bloquea nuevas llamadas. */
export function isOverBudget(projectId: string): boolean {
  const usage = getMonthlyUsage().find((u) => u.projectId === projectId);
  return !!usage && usage.budgetMonthly !== null && usage.totalTokens >= usage.budgetMonthly;
}
