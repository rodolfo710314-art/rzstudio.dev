import path from "node:path";
import { randomUUID } from "node:crypto";
import { APK_DIR, dataFile, ensureDir, readJson, writeJson } from "./jstore";

const TESTERS_FILE = dataFile("testers.json");
const TOKENS_FILE  = dataFile("build-tokens.json");
const META_FILE    = dataFile("apk-metadata.json");

// ─── Types ────────────────────────────────────────────────────────────────────

export type TokenStatus = "pending" | "active" | "expired" | "revoked";

export interface BuildToken {
  token:                string;
  projectId:            string;
  testerId:             string;
  status:               TokenStatus;
  lifetimeDays:         number;
  downloadUrlExpiresAt: string;        // ISO — 24h desde creación
  firstActivatedAt:     string | null; // se fija en el primer heartbeat de la app
  expiresAt:            string | null; // firstActivatedAt + lifetimeDays
  lastHeartbeatAt:      string | null;
  renewalCount:         number;
  createdAt:            string;
  // Seguimiento de correos (cron de mantenimiento)
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

export function getApkMeta(projectId: string): ApkMeta | null {
  return readJson<ApkMeta[]>(META_FILE, []).find((m) => m.projectId === projectId) ?? null;
}

export function listApkMeta(): ApkMeta[] {
  return readJson<ApkMeta[]>(META_FILE, []);
}

export function saveApkMeta(meta: ApkMeta) {
  const all = readJson<ApkMeta[]>(META_FILE, []);
  writeJson(META_FILE, [...all.filter((m) => m.projectId !== meta.projectId), meta]);
}

export function deleteApkMeta(projectId: string) {
  writeJson(META_FILE, readJson<ApkMeta[]>(META_FILE, []).filter((m) => m.projectId !== projectId));
}

export function getApkPath(projectId: string, filename: string): string {
  return path.join(APK_DIR, projectId, filename);
}

export function ensureApkDir(projectId: string) {
  ensureDir(path.join(APK_DIR, projectId));
}

// ─── Testers ──────────────────────────────────────────────────────────────────

export function getTester(id: string): Tester | null {
  return readJson<Tester[]>(TESTERS_FILE, []).find((t) => t.id === id) ?? null;
}

export function getTesterByEmail(email: string): Tester | null {
  return readJson<Tester[]>(TESTERS_FILE, []).find(
    (t) => t.email.toLowerCase() === email.toLowerCase()
  ) ?? null;
}

export function saveTester(tester: Tester): Tester {
  const all = readJson<Tester[]>(TESTERS_FILE, []);
  writeJson(TESTERS_FILE, [...all.filter((t) => t.id !== tester.id), tester]);
  return tester;
}

export function listTesters(): Tester[] {
  return readJson<Tester[]>(TESTERS_FILE, []);
}

// ─── Build Tokens ─────────────────────────────────────────────────────────────

export function getToken(token: string): BuildToken | null {
  return readJson<BuildToken[]>(TOKENS_FILE, []).find((t) => t.token === token) ?? null;
}

export function listTokens(projectId?: string): BuildToken[] {
  const all = readJson<BuildToken[]>(TOKENS_FILE, []);
  return projectId ? all.filter((t) => t.projectId === projectId) : all;
}

export function listTesterTokens(testerId: string, projectId: string): BuildToken[] {
  return readJson<BuildToken[]>(TOKENS_FILE, []).filter(
    (t) => t.testerId === testerId && t.projectId === projectId
  );
}

export function saveToken(token: BuildToken) {
  const all = readJson<BuildToken[]>(TOKENS_FILE, []);
  writeJson(TOKENS_FILE, [...all.filter((t) => t.token !== token.token), token]);
}

export function createBuildToken(
  projectId: string,
  testerId:  string,
  lifetimeDays = DEFAULT_TESTING.apk_lifetime_days,
  expiryHours  = DEFAULT_TESTING.download_link_expiry_hours,
): BuildToken {
  const now = new Date();
  const bt: BuildToken = {
    token:                randomUUID(),
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
  saveToken(bt);
  return bt;
}

// ─── Política de registro (cierra los loopholes de re-registro) ──────────────

export type RegisterVerdict =
  | { allowed: true; existing: BuildToken | null }
  | { allowed: false; reason: "revoked" | "expired_no_renewals" | "expired_needs_admin" ; message: string };

export function checkRegisterPolicy(testerId: string, projectId: string): RegisterVerdict {
  const tokens = listTesterTokens(testerId, projectId);

  // Tester revocado: bloqueado permanentemente hasta intervención del admin
  if (tokens.some((t) => t.status === "revoked")) {
    return {
      allowed: false,
      reason:  "revoked",
      message: "tu acceso a este proyecto fue revocado por el administrador",
    };
  }

  const existing = tokens.find((t) => t.status === "active" || t.status === "pending") ?? null;
  if (existing) return { allowed: true, existing };

  // Token expirado: no se emite uno nuevo — la renovación pasa por el admin
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
export function getTokenStatus(token: string): TokenCheck {
  const bt = getToken(token);
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
export function validateToken(token: string): TokenCheck {
  const bt = getToken(token);
  if (!bt) return { ok: false, status: "revoked", daysRemaining: null, message: "token no encontrado" };

  if (bt.status === "revoked") {
    return { ok: false, status: "revoked", daysRemaining: null, message: "acceso revocado por el administrador" };
  }

  const now = new Date();

  if (bt.status === "pending" && !bt.firstActivatedAt) {
    saveToken({
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
    if (bt.status !== "expired") saveToken({ ...bt, status: "expired" });
    return { ok: false, status: "expired", daysRemaining: 0, message: "periodo de prueba expirado" };
  }

  const daysRemaining = bt.expiresAt
    ? Math.max(0, Math.ceil((new Date(bt.expiresAt).getTime() - now.getTime()) / 86_400_000))
    : 0;
  saveToken({ ...bt, lastHeartbeatAt: now.toISOString() });
  return { ok: true, status: "active", daysRemaining, message: `${daysRemaining} días restantes` };
}

export function revokeToken(token: string): boolean {
  const bt = getToken(token);
  if (!bt) return false;
  saveToken({ ...bt, status: "revoked" });
  return true;
}

export function extendToken(token: string, days: number): BuildToken | null {
  const bt = getToken(token);
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
  saveToken(updated);
  return updated;
}

// ─── Validación de la ventana de descarga (24h) ───────────────────────────────

export function isDownloadValid(token: string): { valid: boolean; meta: ApkMeta | null } {
  const bt = getToken(token);
  if (!bt || bt.status === "revoked") return { valid: false, meta: null };
  if (new Date(bt.downloadUrlExpiresAt) < new Date()) return { valid: false, meta: null };
  const meta = getApkMeta(bt.projectId);
  return { valid: !!meta, meta };
}
