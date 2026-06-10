import { NextRequest, NextResponse } from "next/server";
import { getApkMeta } from "@/lib/apk-store";

type Params = { params: Promise<{ projectId: string }> };

// GET /api/apk/[projectId] — check if APK is available (public, used by AndroidModal)
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const meta = await getApkMeta(projectId);

  if (!meta) return NextResponse.json({ available: false });

  return NextResponse.json({
    available:  true,
    version:    meta.version,
    size:       meta.size,
    uploadedAt: meta.uploadedAt,
  });
}
