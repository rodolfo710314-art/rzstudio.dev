import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHmac } from "node:crypto";
import { COOKIE_NAME, createSessionToken } from "@/lib/admin-session";

function safeCompare(a: string, b: string): boolean {
  try {
    // Pad to equal length before comparison to avoid length-based timing leaks
    const keyA = createHmac("sha256", "rz").update(a).digest();
    const keyB = createHmac("sha256", "rz").update(b).digest();
    return timingSafeEqual(keyA, keyB);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { password } = (await req.json()) as { password?: string };

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "contraseña requerida" }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminSecret || !adminPassword) {
      console.error("[Admin] ADMIN_SECRET o ADMIN_PASSWORD no configurados");
      return NextResponse.json({ error: "configuración incompleta" }, { status: 503 });
    }

    if (!safeCompare(password, adminPassword)) {
      // Delay response to slow brute-force
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({ error: "contraseña incorrecta" }, { status: 401 });
    }

    const token = await createSessionToken(adminSecret);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });
    return response;
  } catch {
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
