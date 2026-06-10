// Veredicto humano desde el Panel de Diagnóstico (doc §9.3).
// Merge pasa SIEMPRE por el Juez de Hierro antes de tocar GitHub.

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { loadManifest } from "@/lib/manifest";
import { judgeCode } from "@/lib/iron-judge";
import { mergeAiPr, purgeAiPr } from "@/lib/github";
import { createActa } from "@/lib/actas";
import { PROJECTS } from "@/components/simbiosis/data";

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { error: "el veredicto requiere sesión de administrador — inicia sesión en /admin" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const projectId = (body.projectId as string | undefined)?.trim() ?? "";
  const action    = body.action as "merge" | "purge" | undefined;

  if (!projectId || (action !== "merge" && action !== "purge")) {
    return NextResponse.json({ error: "projectId y action (merge|purge) requeridos" }, { status: 400 });
  }

  const project  = PROJECTS.find((p) => p.id === projectId);
  const manifest = loadManifest(projectId);

  if (action === "merge") {
    const proposal = `Proyecto: ${project?.name ?? projectId}\nDiff propuesto:\n--- anterior\n${project?.codeDiff.old.join("\n") ?? ""}\n+++ propuesto\n${project?.codeDiff.new.join("\n") ?? ""}`;
    const verdict  = await judgeCode(projectId, proposal, manifest);

    if (!verdict.approved) {
      const acta = await createActa({
        projectId,
        projectName:  project?.name ?? projectId,
        hallazgo:     project?.statusLabel ?? "veredicto directo desde panel",
        transcript:   [{ role: "user", content: "[veredicto directo: ejecutar merge]" }],
        resolution:   "vetoed",
        triggerUsed:  "panel:merge",
        judgeReasons: verdict.reasons,
      });
      return NextResponse.json({ ok: false, vetoed: true, reasons: verdict.reasons, actaId: acta.id }, { status: 409 });
    }

    const gh = await mergeAiPr(manifest);
    const acta = await createActa({
      projectId,
      projectName:  project?.name ?? projectId,
      hallazgo:     project?.statusLabel ?? "veredicto directo desde panel",
      transcript:   [{ role: "user", content: "[veredicto directo: ejecutar merge]" }],
      resolution:   "merged",
      triggerUsed:  "panel:merge",
      judgeReasons: verdict.reasons,
    });
    return NextResponse.json({ ok: true, action: "merged", github: gh.message, actaId: acta.id });
  }

  const gh = await purgeAiPr(manifest);
  const acta = await createActa({
    projectId,
    projectName: project?.name ?? projectId,
    hallazgo:    project?.statusLabel ?? "veredicto directo desde panel",
    transcript:  [{ role: "user", content: "[veredicto directo: purgar entorno]" }],
    resolution:  "purged",
    triggerUsed: "panel:purge",
  });
  return NextResponse.json({ ok: true, action: "purged", github: gh.message, actaId: acta.id });
}
