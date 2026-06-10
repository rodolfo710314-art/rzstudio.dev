// Descarga directa del APK para el administrador (sin token de tester).
// Necesaria porque con RZ_APK_DIR el archivo puede vivir fuera de /public.

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getApkMeta, getApkPath } from "@/lib/apk-store";
import fs from "node:fs";

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });

  const meta = getApkMeta(projectId);
  if (!meta) return NextResponse.json({ error: "sin APK para este proyecto" }, { status: 404 });

  const filePath = getApkPath(projectId, meta.filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "archivo no encontrado en storage" }, { status: 404 });
  }

  return new NextResponse(fs.readFileSync(filePath), {
    status: 200,
    headers: {
      "Content-Type":        "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${meta.filename}"`,
      "Cache-Control":       "no-store",
    },
  });
}
