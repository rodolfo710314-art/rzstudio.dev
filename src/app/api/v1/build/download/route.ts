import { NextRequest, NextResponse } from "next/server";
import { isDownloadValid, getApkPath } from "@/lib/apk-store";
import fs from "node:fs";

// GET /api/v1/build/download?t={token}
// Validates the 24h download window, then streams the APK.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t")?.trim();

  if (!token) {
    return NextResponse.json({ error: "token requerido" }, { status: 400 });
  }

  const { valid, meta } = isDownloadValid(token);

  if (!valid || !meta) {
    return new NextResponse(
      JSON.stringify({ error: "enlace de descarga inválido o expirado" }),
      {
        status: 410,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const filePath = getApkPath(meta.projectId, meta.filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "archivo no encontrado en el servidor" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type":        "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${meta.filename}"`,
      "Content-Length":      String(meta.size),
      "Cache-Control":       "no-store",
    },
  });
}
