// Cost Governor — registro de tokens consumidos por proyecto y agente.
// Fase B: async sobre db.ts (colección `usage` en Firestore | JSONL local).

import { logAppend, logRead } from "./db";
import { loadManifest } from "./manifest";

const COL = "usage";

export interface UsageEntry {
  ts:           string;
  projectId:    string;
  agent:        "ingeniero" | "juez" | "chat" | "historiador";
  model:        string;
  inputTokens:  number;
  outputTokens: number;
}

export async function recordUsage(entry: Omit<UsageEntry, "ts">): Promise<void> {
  await logAppend(COL, { ts: new Date().toISOString(), ...entry });
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
export async function getMonthlyUsage(): Promise<ProjectUsage[]> {
  const now        = new Date();
  const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const all        = await logRead<UsageEntry>(COL, monthStart);

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
export async function isOverBudget(projectId: string): Promise<boolean> {
  const usage = (await getMonthlyUsage()).find((u) => u.projectId === projectId);
  return !!usage && usage.budgetMonthly !== null && usage.totalTokens >= usage.budgetMonthly;
}

/** Tokens consumidos HOY (UTC) por un projectId — para topes diarios (ej. chat público). */
export async function getDailyTokens(projectId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const all   = await logRead<UsageEntry>(COL, today);
  return all
    .filter((e) => e.projectId === projectId)
    .reduce((sum, e) => sum + e.inputTokens + e.outputTokens, 0);
}
