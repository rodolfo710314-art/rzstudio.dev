import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/admin-session";
import { extendToken, getToken, DEFAULT_TESTING } from "@/lib/apk-store";

async function verifyAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const jar   = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return !!token && verifySessionToken(token, secret);
}

// POST /api/v1/build/extend
// Body: { token, days? }  — days defaults to apk_lifetime_days
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { token } = body;
  const days = typeof body.days === "number" ? body.days : DEFAULT_TESTING.apk_lifetime_days;

  if (!token) return NextResponse.json({ error: "token requerido" }, { status: 400 });

  const existing = await getToken(token);
  if (!existing) return NextResponse.json({ error: "token no encontrado" }, { status: 404 });

  if (existing.renewalCount >= DEFAULT_TESTING.max_renewals_per_tester) {
    return NextResponse.json(
      { error: `límite de renovaciones alcanzado (${DEFAULT_TESTING.max_renewals_per_tester})` },
      { status: 409 }
    );
  }

  const updated = await extendToken(token, days);
  if (!updated) return NextResponse.json({ error: "error al extender el token" }, { status: 500 });

  return NextResponse.json({ ok: true, token: updated });
}
