// Store de testers, tokens y metadata de APKs.
// Fase B: async sobre la capa db.ts (Firestore en producción, JSON local en dev).
// Colecciones: testers · build_tokens · apk_meta

import { randomUUID } from "node:crypto";
import { docGet, docSet, docDelete, colList } from "./db";

const COL_TESTERS = "testers";
const COL_TOKENS  = "build_tokens";
const COL_META    = "apk_meta";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TokenStatus = "pending" | "active" | "expired" | "revoked";

export interface BuildToken {
  id:                   string; // = token (doc id)
  token:                string;
  projectId:            string;
  testerId:             string;
  status:               TokenStatus;
  lifetimeDays:         number;
  downloadUrlExpiresAt: string;
  firstActivatedAt:     string | null;
  expiresAt:            string | null;
  lastHeartbeatAt:      string | null;
  renewalCount:         number;
  createdAt:            string;
  warningEmailSentAt?:  string | null;
  followupEmailSentAt?: string | null;
  expiredEmailSentAt?:  string | null;
}

export interface Tester {
  id:        string;
  email:     string;
  nombre:    string;
  rol:       string;
  ip?:       string;
  createdAt: string;
}

export interface ApkMeta {
  id:           string; // = projectId (doc id)
  projectId:    string;
  filename:     string;
  originalName: string;
  size:         number;
  version:      string;
  uploadedAt:   string;
}

export const DEFAULT_TESTING = {
  apk_lifetime_days:           30,
  download_link_expiry_hours:  24,
  grace_period_offline_hours:  48,
  expiry_action:               "block" as const,
  renewal_enabled:             true,
  max_renewals_per_tester:     2,
  warning_days_before:         5,
};

// ─── APK Metadata ─────────────────────────────────────────────────────────────

export async function getApkMeta(projectId: string): Promise<ApkMeta | null> {
  return docGet<ApkMeta>(COL_META, projectId);
}

export async function listApkMeta(): Promise<ApkMeta[]> {
  return colList<ApkMeta>(COL_META);
}

export async function saveApkMeta(meta: Omit<ApkMeta, "id">): Promise<void> {
  await docSet<ApkMeta>(COL_META, { id: meta.projectId, ...meta });
}

export async function deleteApkMeta(projectId: string): Promise<void> {
  await docDelete(COL_META, projectId);
}

// ─── Testers ──────────────────────────────────────────────────────────────────

export async function getTester(id: string): Promise<Tester | null> {
  return docGet<Tester>(COL_TESTERS, id);
}

export async function getTesterByEmail(email: string): Promise<Tester | null> {
  const all = await colList<Tester>(COL_TESTERS);
  return all.find((t) => t.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function saveTester(tester: Tester): Promise<Tester> {
  await docSet<Tester>(COL_TESTERS, tester);
  return tester;
}

export async function listTesters(): Promise<Tester[]> {
  return colList<Tester>(COL_TESTERS);
}

// ─── Build Tokens ─────────────────────────────────────────────────────────────

export async function getToken(token: string): Promise<BuildToken | null> {
  return docGet<BuildToken>(COL_TOKENS, token);
}

export async function listTokens(projectId?: string): Promise<BuildToken[]> {
  return colList<BuildToken>(COL_TOKENS, projectId ? (t) => t.projectId === projectId : undefined);
}

export async function listTesterTokens(testerId: string, projectId: string): Promise<BuildToken[]> {
  return colList<BuildToken>(COL_TOKENS, (t) => t.testerId === testerId && t.projectId === projectId);
}

export async function saveToken(token: BuildToken): Promise<void> {
  await docSet<BuildToken>(COL_TOKENS, token);
}

export async function createBuildToken(
  projectId: string,
  testerId:  string,
  lifetimeDays = DEFAULT_TESTING.apk_lifetime_days,
  expiryHours  = DEFAULT_TESTING.download_link_expiry_hours,
): Promise<BuildToken> {
  const now = new Date();
  const id  = randomUUID();
  const bt: BuildToken = {
    id,
    token:                id,
    projectId,
    testerId,
    status:               "pending",
    lifetimeDays,
    downloadUrlExpiresAt: new Date(now.getTime() + expiryHours * 3_600_000).toISOString(),
    firstActivatedAt:     null,
    expiresAt:            null,
    lastHeartbeatAt:      null,
    renewalCount:         0,
    createdAt:            now.toISOString(),
  };
  await saveToken(bt);
  return bt;
}

// ─── Política de registro (cierra los loopholes de re-registro) ──────────────

export type RegisterVerdict =
  | { allowed: true; existing: BuildToken | null }
  | { allowed: false; reason: "revoked" | "expired_no_renewals" | "expired_needs_admin"; message: string };

export async function checkRegisterPolicy(testerId: string, projectId: string): Promise<RegisterVerdict> {
  const tokens = await listTesterTokens(testerId, projectId);

  if (tokens.some((t) => t.status === "revoked")) {
    return {
      allowed: false,
      reason:  "revoked",
      message: "tu acceso a este proyecto fue revocado por el administrador",
    };
  }

  const existing = tokens.find((t) => t.status === "active" || t.status === "pending") ?? null;
  if (existing) return { allowed: true, existing };

  const expired = tokens.filter((t) => t.status === "expired");
  if (expired.length > 0) {
    const renewals = Math.max(...expired.map((t) => t.renewalCount));
    if (renewals >= DEFAULT_TESTING.max_renewals_per_tester) {
      return {
        allowed: false,
        reason:  "expired_no_renewals",
        message: "alcanzaste el límite de renovaciones para este proyecto",
      };
    }
    return {
      allowed: false,
      reason:  "expired_needs_admin",
      message: "tu periodo de prueba expiró — responde el correo de seguimiento para solicitar renovación",
    };
  }

  return { allowed: true, existing: null };
}

// ─── Estado del token ─────────────────────────────────────────────────────────

export interface TokenCheck {
  ok:            boolean;
  status:        TokenStatus;
  daysRemaining: number | null;
  message:       string;
}

/** SOLO LECTURA — para la página de estado /activate. No muta nada. */
export async function getTokenStatus(token: string): Promise<TokenCheck> {
  const bt = await getToken(token);
  if (!bt) return { ok: false, status: "revoked", daysRemaining: null, message: "token no encontrado" };

  if (bt.status === "revoked") {
    return { ok: false, status: "revoked", daysRemaining: null, message: "acceso revocado por el administrador" };
  }

  if (bt.status === "pending") {
    return {
      ok: true, status: "pending", daysRemaining: bt.lifetimeDays,
      message: `pendiente de activación — ${bt.lifetimeDays} días desde el primer arranque de la app`,
    };
  }

  const now = Date.now();
  if (bt.expiresAt && new Date(bt.expiresAt).getTime() < now) {
    return { ok: false, status: "expired", daysRemaining: 0, message: "periodo de prueba expirado" };
  }

  const days = bt.expiresAt
    ? Math.max(0, Math.ceil((new Date(bt.expiresAt).getTime() - now) / 86_400_000))
    : null;
  return { ok: true, status: bt.status, daysRemaining: days, message: days !== null ? `${days} días restantes` : "activo" };
}

/** MUTANTE — heartbeat de la app Android. Activa en el primer arranque. */
export async function validateToken(token: string): Promise<TokenCheck> {
  const bt = await getToken(token);
  if (!bt) return { ok: false, status: "revoked", daysRemaining: null, message: "token no encontrado" };

  if (bt.status === "revoked") {
    return { ok: false, status: "revoked", daysRemaining: null, message: "acceso revocado por el administrador" };
  }

  const now = new Date();

  if (bt.status === "pending" && !bt.firstActivatedAt) {
    await saveToken({
      ...bt,
      status:           "active",
      firstActivatedAt: now.toISOString(),
      expiresAt:        new Date(now.getTime() + bt.lifetimeDays * 86_400_000).toISOString(),
      lastHeartbeatAt:  now.toISOString(),
    });
    return {
      ok: true, status: "active", daysRemaining: bt.lifetimeDays,
      message: `entorno activado — ${bt.lifetimeDays} días de prueba`,
    };
  }

  if (bt.expiresAt && new Date(bt.expiresAt) < now) {
    if (bt.status !== "expired") await saveToken({ ...bt, status: "expired" });
    return { ok: false, status: "expired", daysRemaining: 0, message: "periodo de prueba expirado" };
  }

  const daysRemaining = bt.expiresAt
    ? Math.max(0, Math.ceil((new Date(bt.expiresAt).getTime() - now.getTime()) / 86_400_000))
    : 0;
  await saveToken({ ...bt, lastHeartbeatAt: now.toISOString() });
  return { ok: true, status: "active", daysRemaining, message: `${daysRemaining} días restantes` };
}

export async function revokeToken(token: string): Promise<boolean> {
  const bt = await getToken(token);
  if (!bt) return false;
  await saveToken({ ...bt, status: "revoked" });
  return true;
}

export async function extendToken(token: string, days: number): Promise<BuildToken | null> {
  const bt = await getToken(token);
  if (!bt) return null;

  const base = bt.expiresAt ? new Date(bt.expiresAt).getTime() : Date.now();
  const updated: BuildToken = {
    ...bt,
    status:             bt.status === "expired" ? "active" : bt.status,
    expiresAt:          new Date(Math.max(base, Date.now()) + days * 86_400_000).toISOString(),
    renewalCount:       bt.renewalCount + 1,
    warningEmailSentAt: null,
    expiredEmailSentAt: null,
  };
  await saveToken(updated);
  return updated;
}

// ─── Validación de la ventana de descarga (24h) ───────────────────────────────

export async function isDownloadValid(token: string): Promise<{ valid: boolean; meta: ApkMeta | null }> {
  const bt = await getToken(token);
  if (!bt || bt.status === "revoked") return { valid: false, meta: null };
  if (new Date(bt.downloadUrlExpiresAt) < new Date()) return { valid: false, meta: null };
  const meta = await getApkMeta(bt.projectId);
  return { valid: !!meta, meta };
}
