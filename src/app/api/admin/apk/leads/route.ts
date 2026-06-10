import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/admin-session";
import { listTokens, getTester } from "@/lib/apk-store";

async function verifyAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const jar   = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return !!token && verifySessionToken(token, secret);
}

// GET /api/admin/apk/leads?projectId=xx (optional filter)
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  const tokens    = await listTokens(projectId);

  // Return enriched with tester info for backwards compatibility
  const enriched = await Promise.all(tokens.map(async (t) => {
    const tester = await getTester(t.testerId);
    return {
      id:          t.token,
      projectId:   t.projectId,
      nombre:      tester?.nombre ?? "",
      email:       tester?.email  ?? "",
      rol:         tester?.rol    ?? "",
      status:      t.status,
      requestedAt: t.createdAt,
    };
  }));

  return NextResponse.json(enriched);
}
