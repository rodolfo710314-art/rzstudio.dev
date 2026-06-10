// Descarga directa del APK para el administrador (sin token de tester).

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getApkMeta } from "@/lib/apk-store";
import { readApkBlob } from "@/lib/blob";

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });

  const meta = await getApkMeta(projectId);
  if (!meta) return NextResponse.json({ error: "sin APK para este proyecto" }, { status: 404 });

  const data = await readApkBlob(projectId, meta.filename);
  if (!data) {
    return NextResponse.json({ error: "archivo no encontrado en storage" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type":        "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${meta.filename}"`,
      "Cache-Control":       "no-store",
    },
  });
}
