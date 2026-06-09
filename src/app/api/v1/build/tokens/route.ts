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

// GET /api/v1/build/tokens?projectId=   (optional filter)
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  const tokens    = listTokens(projectId);

  // Enrich with tester info
  const enriched = tokens.map((t) => {
    const tester = getTester(t.testerId);
    return {
      ...t,
      tester: tester ? { nombre: tester.nombre, email: tester.email, rol: tester.rol } : null,
      daysRemaining: t.expiresAt
        ? Math.max(0, Math.ceil((new Date(t.expiresAt).getTime() - Date.now()) / 86_400_000))
        : null,
    };
  });

  // Sort: active first, then by createdAt desc
  enriched.sort((a, b) => {
    const order = { active: 0, pending: 1, expired: 2, revoked: 3 };
    const diff = (order[a.status] ?? 4) - (order[b.status] ?? 4);
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json(enriched);
}
