// Cliente LLM unificado (Fase C — ADR 11/06/2026):
//   intento 1 → Claude Sonnet 4.6 (Anthropic)
//   intento 2 → Gemini vía Vertex AI cuando Anthropic falla (429/5xx/timeout/red)
//
// Vertex autentica con la service account de Cloud Run (igual que Firestore):
//   gcloud services enable aiplatform.googleapis.com
//   rol: roles/aiplatform.user
//
// Todo consumo se registra en el Cost Governor con el modelo que respondió,
// para que las actas y el dashboard auditen qué motor actuó.

import { GoogleAuth } from "google-auth-library";
import { getActiveKey } from "./runtime-key";
import { recordUsage, type UsageEntry } from "./usage";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const GEMINI_MODEL    = process.env.GEMINI_MODEL ?? "gemini-3.1-pro";
const VERTEX_LOCATION = process.env.GOOGLE_VERTEX_LOCATION ?? "global";
const TIMEOUT_MS      = 60_000;

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmRequest {
  system:       string;
  messages:     LlmMessage[];
  maxTokens:    number;
  temperature?: number;
  // Para el Cost Governor:
  projectId:    string;
  agent:        UsageEntry["agent"];
  /** Modelo Anthropic a usar como primario (default: claude-sonnet-4-6). */
  anthropicModel?: string;
}

export interface LlmResult {
  text:     string;
  model:    string;
  provider: "anthropic" | "google";
}

let _auth: GoogleAuth | null = null;
function auth(): GoogleAuth {
  if (!_auth) _auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  return _auth;
}

// ─── Anthropic (primario) ─────────────────────────────────────────────────────

async function callAnthropic(req: LlmRequest): Promise<LlmResult> {
  const apiKey = await getActiveKey();
  if (!apiKey) throw new Error("sin api key de anthropic");

  const model = req.anthropicModel ?? ANTHROPIC_MODEL;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens,
      ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
      system:   req.system,
      messages: req.messages,
    }),
  });

  if (!res.ok) throw new Error(`anthropic ${res.status}`);

  const data = await res.json();
  await recordUsage({
    projectId:    req.projectId,
    agent:        req.agent,
    model,
    inputTokens:  data?.usage?.input_tokens  ?? 0,
    outputTokens: data?.usage?.output_tokens ?? 0,
  });

  return {
    text:     data?.content?.[0]?.text ?? "",
    model,
    provider: "anthropic",
  };
}

// ─── Gemini vía Vertex AI (respaldo) ─────────────────────────────────────────

async function callGemini(req: LlmRequest): Promise<LlmResult> {
  const projectId = await auth().getProjectId();
  const token     = await auth().getAccessToken();
  if (!token) throw new Error("sin credenciales de google cloud");

  const host = VERTEX_LOCATION === "global"
    ? "aiplatform.googleapis.com"
    : `${VERTEX_LOCATION}-aiplatform.googleapis.com`;
  const url = `https://${host}/v1/projects/${projectId}/locations/${VERTEX_LOCATION}/publishers/google/models/${GEMINI_MODEL}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: req.messages.map((m) => ({
        role:  m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: req.maxTokens,
        ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`vertex ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data  = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text  = parts.map((p: { text?: string }) => p.text ?? "").join("");

  await recordUsage({
    projectId:    req.projectId,
    agent:        req.agent,
    model:        GEMINI_MODEL,
    inputTokens:  data?.usageMetadata?.promptTokenCount     ?? 0,
    outputTokens: data?.usageMetadata?.candidatesTokenCount ?? 0,
  });

  return { text, model: GEMINI_MODEL, provider: "google" };
}

// ─── Cliente unificado ────────────────────────────────────────────────────────

export async function callLLM(req: LlmRequest): Promise<LlmResult> {
  try {
    return await callAnthropic(req);
  } catch (primaryErr) {
    console.warn(`[llm] anthropic no disponible (${(primaryErr as Error).message}) — fallback a ${GEMINI_MODEL}`);
    try {
      return await callGemini(req);
    } catch (fallbackErr) {
      console.error(`[llm] fallback gemini también falló: ${(fallbackErr as Error).message}`);
      throw new Error(
        `ningún motor disponible — anthropic: ${(primaryErr as Error).message} · gemini: ${(fallbackErr as Error).message}`,
      );
    }
  }
}
