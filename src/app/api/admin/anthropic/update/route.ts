import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-session";
import { setActiveKey, maskKey } from "@/lib/runtime-key";

const KEY_PATTERN = /^sk-ant-/;

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return NextResponse.json({ error: "no configurado" }, { status: 503 });

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifySessionToken(token, secret))) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const { key } = (await req.json()) as { key?: string };
  if (!key || typeof key !== "string" || !KEY_PATTERN.test(key.trim())) {
    return NextResponse.json(
      { error: "formato de key inválido — debe comenzar con sk-ant-" },
      { status: 400 }
    );
  }

  const cleanKey = key.trim();

  // Validate against Anthropic before storing
  const testRes = await fetch("https://api.anthropic.com/v1/messages/count_tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cleanKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      messages: [{ role: "user", content: "ping" }],
    }),
  });

  if (testRes.status === 401) {
    return NextResponse.json({ error: "api key inválida — anthropic rechazó la key" }, { status: 422 });
  }
  if (!testRes.ok && testRes.status !== 429) {
    // 429 means valid key but rate-limited — still accept it
    return NextResponse.json(
      { error: `anthropic respondió con error ${testRes.status}` },
      { status: 422 }
    );
  }

  // Key is valid — activate and persist (Firestore)
  await setActiveKey(cleanKey);

  const rpm = parseInt(testRes.headers.get("x-ratelimit-limit-requests") ?? "0", 10);
  const tpm = parseInt(testRes.headers.get("x-ratelimit-limit-tokens")   ?? "0", 10);

  return NextResponse.json({
    ok: true,
    key_masked: maskKey(cleanKey),
    rpm_limit:  rpm || undefined,
    tpm_limit:  tpm || undefined,
    note:        "key activa. si reiniciaste el servidor, aplica desde .env.local automáticamente.",
  });
}
