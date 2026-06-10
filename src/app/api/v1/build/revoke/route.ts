import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/admin-session";
import { revokeToken } from "@/lib/apk-store";

async function verifyAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const jar   = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return !!token && verifySessionToken(token, secret);
}

// POST /api/v1/build/revoke
// Body: { token }
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "token requerido" }, { status: 400 });

  const ok = await revokeToken(token);
  if (!ok) return NextResponse.json({ error: "token no encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true, message: "token revocado" });
}
