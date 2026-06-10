import { NextRequest, NextResponse } from "next/server";
import { isDownloadValid } from "@/lib/apk-store";
import { readApkBlob } from "@/lib/blob";

// GET /api/v1/build/download?t={token}
// Valida la ventana de descarga de 24h y entrega el APK (GCS o disco local).
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t")?.trim();

  if (!token) {
    return NextResponse.json({ error: "token requerido" }, { status: 400 });
  }

  const { valid, meta } = await isDownloadValid(token);

  if (!valid || !meta) {
    return new NextResponse(
      JSON.stringify({ error: "enlace de descarga inválido o expirado" }),
      { status: 410, headers: { "Content-Type": "application/json" } },
    );
  }

  const data = await readApkBlob(meta.projectId, meta.filename);
  if (!data) {
    return NextResponse.json({ error: "archivo no encontrado en el servidor" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type":        "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${meta.filename}"`,
      "Content-Length":      String(meta.size),
      "Cache-Control":       "no-store",
    },
  });
}
