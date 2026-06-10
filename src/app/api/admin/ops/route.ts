// Estado operativo consolidado para el dashboard admin:
// integraciones, consumo de tokens (Cost Governor), actas y log del Juez de Hierro.

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getActiveKey } from "@/lib/runtime-key";
import { emailConfigured } from "@/lib/email";
import { githubConfigured } from "@/lib/github";
import { isPersistentStorage } from "@/lib/jstore";
import { getMonthlyUsage } from "@/lib/usage";
import { getJudgeLog } from "@/lib/iron-judge";
import { listActas, readActa } from "@/lib/actas";
import { listManifests } from "@/lib/manifest";

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  // Lectura de una acta individual: /api/admin/ops?acta=<id>
  const actaId = req.nextUrl.searchParams.get("acta");
  if (actaId) {
    const md = readActa(actaId);
    if (!md) return NextResponse.json({ error: "acta no encontrada" }, { status: 404 });
    return NextResponse.json({ id: actaId, markdown: md });
  }

  return NextResponse.json({
    integrations: {
      anthropic:   !!getActiveKey(),
      email:       emailConfigured(),
      github:      githubConfigured(),
      cron:        !!process.env.CRON_SECRET,
      persistence: isPersistentStorage(),
    },
    usage:     getMonthlyUsage(),
    actas:     listActas().slice(0, 30),
    judgeLog:  getJudgeLog(30),
    manifests: listManifests().map((m) => ({ project_id: m.project_id, name: m.name })),
  });
}
