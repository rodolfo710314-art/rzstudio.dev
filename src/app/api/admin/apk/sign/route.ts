// Paso 1 de la subida directa: genera la sesión resumable de GCS.
// El navegador sube el APK (hasta 5 TB) directo al bucket — Cloud Run solo firma.

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { gcsEnabled, createUploadSession } from "@/lib/blob";

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const projectId = (body.projectId as string | undefined)?.trim();
  const version   = ((body.version as string | undefined) ?? "").trim() || "1.0.0";
  const origName  = (body.filename as string | undefined) ?? "";

  if (!projectId) {
    return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
  }
  if (!origName.toLowerCase().endsWith(".apk")) {
    return NextResponse.json({ error: "solo se aceptan archivos .apk" }, { status: 400 });
  }

  // Driver local (dev): sin GCS la subida va por multipart al endpoint clásico (límite 30 MB)
  if (!gcsEnabled()) {
    return NextResponse.json({ mode: "multipart" });
  }

  const safeId   = projectId.replace(/[^a-z0-9-]/gi, "_");
  const filename = `app-${safeId}-v${version}.apk`;
  // Detrás del proxy de Cloud Run, nextUrl.origin puede no ser el dominio público.
  // El origin de la sesión GCS DEBE coincidir exactamente con el del navegador,
  // o el preflight CORS bloquea la subida en silencio.
  // Sanitizado: tolera comas/espacios/slash residuales pegados en la consola
  const origin   = (process.env.RZ_BASE_URL ?? req.nextUrl.origin).trim().replace(/[,\/\s]+$/, "");

  try {
    const uploadUrl = await createUploadSession(
      safeId,
      filename,
      "application/vnd.android.package-archive",
      origin,
    );
    return NextResponse.json({ mode: "gcs", uploadUrl, filename, projectId: safeId, version });
  } catch (err) {
    console.error("[apk/sign]", (err as Error).message);
    return NextResponse.json(
      { error: "no se pudo crear la sesión de subida en gcs — revisa permisos del bucket" },
      { status: 502 },
    );
  }
}
