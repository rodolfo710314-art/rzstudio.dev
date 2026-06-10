// War Room — chat dialéctico real (doc §10).
// El servidor es la autoridad de las llaves de ejecución: el modelo nunca
// decide acciones; solo el texto literal del administrador las dispara.

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getActiveKey } from "@/lib/runtime-key";
import { assembleSystemPrompt, detectTrigger } from "@/lib/manifest";
import { judgeCode } from "@/lib/iron-judge";
import { mergeAiPr, purgeAiPr } from "@/lib/github";
import { createActa, recallContext } from "@/lib/actas";
import { recordUsage, isOverBudget } from "@/lib/usage";
import { PROJECTS } from "@/components/simbiosis/data";

const MODEL = "claude-sonnet-4-6";

interface Msg { role: "user" | "assistant"; content: string }

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { error: "el war room requiere sesión de administrador — inicia sesión en /admin" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const projectId = (body.projectId as string | undefined)?.trim() ?? "";
  const rawMsgs   = Array.isArray(body.messages) ? (body.messages as Msg[]) : [];

  const messages: Msg[] = rawMsgs
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-24);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!projectId || !lastUser) {
    return NextResponse.json({ error: "projectId y messages son requeridos" }, { status: 400 });
  }

  const project = PROJECTS.find((p) => p.id === projectId);
  const { prompt, manifest } = assembleSystemPrompt(projectId);

  // ─── Llaves de ejecución (autoridad del servidor) ──────────────────────────
  const trigger = detectTrigger(lastUser.content);

  if (trigger === "merge") {
    // El Juez de Hierro evalúa ANTES de tocar GitHub (doc §12.2)
    const proposal = [
      `Proyecto: ${project?.name ?? projectId}`,
      `Diff propuesto:\n--- anterior\n${project?.codeDiff.old.join("\n") ?? "(sin diff)"}\n+++ propuesto\n${project?.codeDiff.new.join("\n") ?? ""}`,
      `Contexto del debate:\n${messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n")}`,
    ].join("\n\n");

    const verdict = await judgeCode(projectId, proposal, manifest);

    if (!verdict.approved) {
      const acta = createActa({
        projectId,
        projectName:  project?.name ?? projectId,
        hallazgo:     project?.statusLabel ?? "sesión on-demand",
        transcript:   messages,
        resolution:   "vetoed",
        triggerUsed:  "va que va",
        judgeReasons: verdict.reasons,
      });
      return NextResponse.json({
        action:  "vetoed",
        actaId:  acta.id,
        log: [
          "> [TRIGGER] llave de ejecución detectada: va que va",
          "> [JUEZ] evaluando propuesta a temperatura 0...",
          "> [VETO] el juez de hierro rechazó el código:",
          ...verdict.reasons.map((r) => `>   ✗ ${r}`),
          "> [GITHUB] acción cancelada. el conflicto queda en esta sala.",
          `> [ACTA] sesión documentada (${acta.id}).`,
        ],
      });
    }

    const gh = await mergeAiPr(manifest);
    const acta = createActa({
      projectId,
      projectName:  project?.name ?? projectId,
      hallazgo:     project?.statusLabel ?? "sesión on-demand",
      transcript:   messages,
      resolution:   "merged",
      triggerUsed:  "va que va",
      judgeReasons: verdict.reasons,
    });

    return NextResponse.json({
      action: "merged",
      actaId: acta.id,
      log: [
        "> [TRIGGER] llave de ejecución detectada: va que va",
        "> [JUEZ] propuesta aprobada por el juez de hierro.",
        `> [GITHUB] ${gh.message}${gh.url ? ` — ${gh.url}` : ""}`,
        `> [ACTA] sesión documentada (${acta.id}).`,
        "> [FIN] sesión cerrada.",
      ],
    });
  }

  if (trigger === "purge") {
    const gh = await purgeAiPr(manifest);
    const acta = createActa({
      projectId,
      projectName: project?.name ?? projectId,
      hallazgo:    project?.statusLabel ?? "sesión on-demand",
      transcript:  messages,
      resolution:  "purged",
      triggerUsed: lastUser.content.toLowerCase().includes("cuello") ? "darle cuello" : "abortar misión",
    });

    return NextResponse.json({
      action: "purged",
      actaId: acta.id,
      log: [
        "> [TRIGGER] llave de ejecución detectada: descarte",
        `> [GITHUB] ${gh.message}`,
        "> [ENTORNO] estado restaurado a HEAD.",
        `> [ACTA] sesión documentada (${acta.id}).`,
        "> [FIN] sesión cerrada.",
      ],
    });
  }

  // ─── Debate normal con el Agente Ingeniero ─────────────────────────────────
  const apiKey = getActiveKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "sin conexión a anthropic — conecta la cuenta desde el panel de administración" },
      { status: 503 },
    );
  }

  if (isOverBudget(projectId)) {
    return NextResponse.json(
      { error: `presupuesto mensual de tokens agotado para el proyecto ${projectId} — el cost governor bloqueó la llamada` },
      { status: 429 },
    );
  }

  // Evidencia de la sesión: el hallazgo, los logs del motor y el diff en debate
  const evidence = project
    ? `\n\nEVIDENCIA DE LA SESIÓN ACTUAL:
Hallazgo: ${project.statusLabel}
Log de auditoría:\n${project.auditLogs.join("\n")}
Diff propuesto en debate:\n--- código actual\n${project.codeDiff.old.join("\n")}\n+++ código propuesto\n${project.codeDiff.new.join("\n")}`
    : "";

  const system = prompt + evidence + recallContext(projectId);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 1024,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("War Room — Anthropic error:", res.status, errText);
    return NextResponse.json({ error: `el agente no respondió (${res.status})` }, { status: 502 });
  }

  const data = await res.json();
  recordUsage({
    projectId,
    agent:        "ingeniero",
    model:        MODEL,
    inputTokens:  data?.usage?.input_tokens  ?? 0,
    outputTokens: data?.usage?.output_tokens ?? 0,
  });

  return NextResponse.json({
    action: "reply",
    reply:  data?.content?.[0]?.text ?? "…",
  });
}
