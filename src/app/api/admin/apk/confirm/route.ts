// Paso 2 de la subida directa: el navegador terminó de subir a GCS.
// Verificamos que el objeto exista de verdad (y su tamaño real) antes de
// registrar la metadata — nunca confiamos en lo que declare el cliente.

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { saveApkMeta, getApkMeta } from "@/lib/apk-store";
import { statApkBlob, deleteApkBlob } from "@/lib/blob";

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const projectId    = (body.projectId as string | undefined)?.trim();
  const filename     = (body.filename as string | undefined)?.trim();
  const version      = ((body.version as string | undefined) ?? "1.0.0").trim();
  const originalName = (body.originalName as string | undefined) ?? filename ?? "";

  if (!projectId || !filename) {
    return NextResponse.json({ error: "projectId y filename requeridos" }, { status: 400 });
  }

  const size = await statApkBlob(projectId, filename);
  if (size === null || size === 0) {
    return NextResponse.json(
      { error: "el objeto no existe en el bucket — la subida no se completó" },
      { status: 409 },
    );
  }

  // Borrar el binario anterior si tenía otro nombre de archivo
  const prev = await getApkMeta(projectId);
  if (prev && prev.filename !== filename) {
    await deleteApkBlob(projectId, prev.filename);
  }

  const meta = {
    projectId,
    filename,
    originalName,
    size,
    version,
    uploadedAt: new Date().toISOString(),
  };
  await saveApkMeta(meta);

  return NextResponse.json({ ok: true, meta });
}
