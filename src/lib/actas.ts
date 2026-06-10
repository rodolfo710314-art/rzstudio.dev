// Actas de Simbiosis (doc §11) — el Agente Historiador documenta cada sesión
// del War Room: hallazgo, debate, resolución y el prompt de autorización humano.
// Jerarquía: Proyecto → Iteraciones → Sesión de Debate.

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DATA_DIR, ensureDir, dataFile, readJson, writeJson } from "./jstore";

const ACTAS_DIR   = path.join(DATA_DIR, "actas");
const ACTAS_INDEX = dataFile("actas-index.json");

export interface ActaMeta {
  id:          string;
  projectId:   string;
  resolution:  "merged" | "purged" | "vetoed" | "abierta";
  triggerUsed: string | null;
  createdAt:   string;
  file:        string;
}

export interface ActaInput {
  projectId:    string;
  projectName:  string;
  hallazgo:     string;
  transcript:   { role: string; content: string }[];
  resolution:   ActaMeta["resolution"];
  triggerUsed:  string | null;
  judgeReasons?: string[];
}

export function createActa(input: ActaInput): ActaMeta {
  const id  = randomUUID().slice(0, 8);
  const now = new Date();
  const file = `${input.projectId}/${now.toISOString().slice(0, 10)}-${id}.md`;

  const debate = input.transcript
    .map((m) => `**${m.role === "user" ? "administrador" : "agente"}:** ${m.content}`)
    .join("\n\n");

  const md = `# Acta de Simbiosis — ${input.projectName}

- **id de sesión:** ${id}
- **proyecto:** ${input.projectId}
- **fecha:** ${now.toISOString()}
- **resolución:** ${input.resolution}
- **llave de ejecución usada:** ${input.triggerUsed ?? "ninguna"}

## hallazgo original

${input.hallazgo}

## debate

${debate}

${input.judgeReasons?.length ? `## veredicto del juez de hierro\n\n${input.judgeReasons.map((r) => `- ${r}`).join("\n")}\n` : ""}
## resolución final

${input.resolution === "merged" ? "✓ aprobado e integrado por el administrador con la llave de ejecución."
  : input.resolution === "purged" ? "✗ descartado por el administrador. entorno purgado."
  : input.resolution === "vetoed" ? "⊘ vetado por el juez de hierro antes del merge."
  : "sesión cerrada sin resolución."}
`;

  const fullPath = path.join(ACTAS_DIR, file);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, md);

  const meta: ActaMeta = {
    id,
    projectId:   input.projectId,
    resolution:  input.resolution,
    triggerUsed: input.triggerUsed,
    createdAt:   now.toISOString(),
    file,
  };

  const index = readJson<ActaMeta[]>(ACTAS_INDEX, []);
  writeJson(ACTAS_INDEX, [...index, meta]);
  return meta;
}

export function listActas(projectId?: string): ActaMeta[] {
  const all = readJson<ActaMeta[]>(ACTAS_INDEX, []);
  return (projectId ? all.filter((a) => a.projectId === projectId) : all)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function readActa(id: string): string | null {
  const meta = readJson<ActaMeta[]>(ACTAS_INDEX, []).find((a) => a.id === id);
  if (!meta) return null;
  try {
    return fs.readFileSync(path.join(ACTAS_DIR, meta.file), "utf-8");
  } catch {
    return null;
  }
}

/** Recuperación de contexto para futuras sesiones (memoria del proyecto, doc §11.2).
 *  Versión local sin vector DB: entrega las últimas N actas del proyecto. */
export function recallContext(projectId: string, maxActas = 3): string {
  const recent = listActas(projectId).slice(0, maxActas);
  if (recent.length === 0) return "";
  const bodies = recent
    .map((a) => readActa(a.id))
    .filter(Boolean)
    .map((md) => (md as string).slice(0, 2000));
  return `\n\nMEMORIA DEL PROYECTO (actas de sesiones anteriores — no repitas debates ya resueltos):\n${bodies.join("\n---\n")}`;
}
