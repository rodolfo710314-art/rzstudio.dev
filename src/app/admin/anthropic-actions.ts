"use server";

import { cookies } from "next/headers";
import { connection } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/admin-session";
import { setActiveKey, persistKeyToEnvFile, maskKey } from "@/lib/runtime-key";

export interface KeyUpdateState {
  ok?: boolean;
  error?: string;
  key_masked?: string;
  rpm_limit?: number;
  tpm_limit?: number;
}

const KEY_PATTERN = /^sk-ant-/;

export async function updateAnthropicKey(
  _prev: KeyUpdateState,
  formData: FormData
): Promise<KeyUpdateState> {
  await connection(); // fuerza evaluación de process.env en runtime

  const secret = process.env.ADMIN_SECRET;
  if (!secret) return { error: "no configurado" };

  const jar   = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token || !(await verifySessionToken(token, secret))) {
    return { error: "sesión expirada — recarga la página" };
  }

  const key = ((formData.get("api_key") as string) ?? "").trim();

  if (!key || !KEY_PATTERN.test(key)) {
    return { error: "formato inválido — la key debe comenzar con sk-ant-" };
  }

  // Validate against Anthropic
  const testRes = await fetch("https://api.anthropic.com/v1/messages/count_tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      messages: [{ role: "user", content: "ping" }],
    }),
  });

  if (testRes.status === 401) {
    return { error: "api key inválida — anthropic la rechazó" };
  }
  if (!testRes.ok && testRes.status !== 429) {
    return { error: `anthropic respondió con error ${testRes.status}` };
  }

  setActiveKey(key);
  persistKeyToEnvFile(key);

  const rpm = parseInt(testRes.headers.get("x-ratelimit-limit-requests") ?? "0", 10);
  const tpm = parseInt(testRes.headers.get("x-ratelimit-limit-tokens")   ?? "0", 10);

  return {
    ok:         true,
    key_masked: maskKey(key),
    rpm_limit:  rpm || undefined,
    tpm_limit:  tpm || undefined,
  };
}
