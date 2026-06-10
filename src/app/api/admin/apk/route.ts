import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { saveApkMeta, listApkMeta, deleteApkMeta, getApkMeta } from "@/lib/apk-store";
import { saveApkBlob, deleteApkBlob } from "@/lib/blob";

// GET /api/admin/apk — list all uploaded APKs
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  return NextResponse.json(await listApkMeta());
}

// POST /api/admin/apk — upload APK for a project
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const formData  = await req.formData();
  const file      = formData.get("apk") as File | null;
  const projectId = (formData.get("projectId") as string | null)?.trim();
  const version   = ((formData.get("version") as string | null) ?? "").trim() || "1.0.0";

  if (!file || !projectId) {
    return NextResponse.json({ error: "faltan parámetros: apk y projectId" }, { status: 400 });
  }

  if (!file.name.endsWith(".apk")) {
    return NextResponse.json({ error: "solo se aceptan archivos .apk" }, { status: 400 });
  }

  const safeId   = projectId.replace(/[^a-z0-9-]/gi, "_");
  const filename = `app-${safeId}-v${version}.apk`;

  // Eliminar el binario anterior del proyecto, si existe
  const prev = await getApkMeta(safeId);
  if (prev) await deleteApkBlob(safeId, prev.filename);

  const buf = Buffer.from(await file.arrayBuffer());
  await saveApkBlob(safeId, filename, buf);

  const meta = {
    projectId:    safeId,
    filename,
    originalName: file.name,
    size:         file.size,
    version,
    uploadedAt:   new Date().toISOString(),
  };

  await saveApkMeta(meta);

  return NextResponse.json({ ok: true, meta });
}

// DELETE /api/admin/apk?projectId=xx
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
  }

  const meta = await getApkMeta(projectId);
  if (!meta) {
    return NextResponse.json({ error: "no hay APK para este proyecto" }, { status: 404 });
  }

  await deleteApkBlob(projectId, meta.filename);
  await deleteApkMeta(projectId);

  return NextResponse.json({ ok: true });
}
