import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-session";
import { getActiveKey, maskKey } from "@/lib/runtime-key";

export interface AnthropicStatus {
  connected: boolean;
  key_masked?: string;
  plan_tier?: "free" | "build" | "scale" | "enterprise";
  rpm_limit?: number;
  tpm_limit?: number;
  validated_at?: string;
  error?: string;
}

function detectPlanTier(tpm: number): AnthropicStatus["plan_tier"] {
  if (tpm >= 300_000) return "scale";
  if (tpm >= 30_000)  return "build";
  if (tpm > 0)        return "free";
  return undefined;
}

async function validateKey(apiKey: string): Promise<AnthropicStatus> {
  // count_tokens is the cheapest validation call — consumes zero tokens
  const res = await fetch("https://api.anthropic.com/v1/messages/count_tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      messages: [{ role: "user", content: "ping" }],
    }),
  });

  if (res.status === 401) {
    return { connected: false, error: "api key inválida o expirada" };
  }
  if (res.status === 403) {
    return { connected: false, error: "sin permisos para este workspace" };
  }
  if (!res.ok) {
    return { connected: false, error: `error anthropic: ${res.status}` };
  }

  const rpm  = parseInt(res.headers.get("x-ratelimit-limit-requests") ?? "0", 10);
  const tpm  = parseInt(res.headers.get("x-ratelimit-limit-tokens")   ?? "0", 10);

  return {
    connected:    true,
    key_masked:   maskKey(apiKey),
    plan_tier:    detectPlanTier(tpm),
    rpm_limit:    rpm || undefined,
    tpm_limit:    tpm || undefined,
    validated_at: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  // Verify admin session
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return NextResponse.json({ error: "no configurado" }, { status: 503 });

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifySessionToken(token, secret))) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const key = getActiveKey();
  if (!key) {
    return NextResponse.json({ connected: false, error: "sin api key configurada" });
  }

  const status = await validateKey(key);
  return NextResponse.json(status);
}
