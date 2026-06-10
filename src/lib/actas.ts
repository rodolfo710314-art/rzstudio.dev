// Actas de Simbiosis (doc §11) — documentación automática de cada sesión.
// Fase B: colección `actas` (el markdown viaja dentro del documento — <1MB, sobra).

import { randomUUID } from "node:crypto";
import { docGet, docSet, colList } from "./db";

const COL = "actas";

export interface ActaDoc {
  id:          string;
  projectId:   string;
  resolution:  "merged" | "purged" | "vetoed" | "abierta";
  triggerUsed: string | null;
  createdAt:   string;
  markdown:    string;
}

export type ActaMeta = Omit<ActaDoc, "markdown">;

export interface ActaInput {
  projectId:    string;
  projectName:  string;
  hallazgo:     string;
  transcript:   { role: string; content: string }[];
  resolution:   ActaDoc["resolution"];
  triggerUsed:  string | null;
  judgeReasons?: string[];
  /** Motores que actuaron en la sesión (trazabilidad del fallback, ADR 11/06/2026). */
  engine?:      string;
  judgeModel?:  string;
}

export async function createActa(input: ActaInput): Promise<ActaMeta> {
  const id  = randomUUID().slice(0, 8);
  const now = new Date();

  const debate = input.transcript
    .map((m) => `**${m.role === "user" ? "administrador" : "agente"}:** ${m.content}`)
    .join("\n\n");

  const markdown = `# Acta de Simbiosis — ${input.projectName}

- **id de sesión:** ${id}
- **proyecto:** ${input.projectId}
- **fecha:** ${now.toISOString()}
- **resolución:** ${input.resolution}
- **llave de ejecución usada:** ${input.triggerUsed ?? "ninguna"}
- **motor del agente:** ${input.engine ?? "no registrado"}
- **motor del juez:** ${input.judgeModel ?? "no aplicó"}

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

  const doc: ActaDoc = {
    id,
    projectId:   input.projectId,
    resolution:  input.resolution,
    triggerUsed: input.triggerUsed,
    createdAt:   now.toISOString(),
    markdown,
  };
  await docSet<ActaDoc>(COL, doc);

  const { markdown: _omit, ...meta } = doc;
  return meta;
}

export async function listActas(projectId?: string): Promise<ActaMeta[]> {
  const all = await colList<ActaDoc>(COL, projectId ? (a) => a.projectId === projectId : undefined);
  return all
    .map(({ markdown: _omit, ...meta }) => meta)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readActa(id: string): Promise<string | null> {
  const doc = await docGet<ActaDoc>(COL, id);
  return doc?.markdown ?? null;
}

/** Memoria del proyecto (doc §11.2) — versión local: últimas N actas.
 *  (La recuperación semántica con la búsqueda vectorial de Firestore llega con el RAG.) */
export async function recallContext(projectId: string, maxActas = 3): Promise<string> {
  const all = await colList<ActaDoc>(COL, (a) => a.projectId === projectId);
  const recent = all
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, maxActas);
  if (recent.length === 0) return "";
  const bodies = recent.map((a) => a.markdown.slice(0, 2000));
  return `\n\nMEMORIA DEL PROYECTO (actas de sesiones anteriores — no repitas debates ya resueltos):\n${bodies.join("\n---\n")}`;
}
