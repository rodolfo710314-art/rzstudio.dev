import fs from "node:fs";
import path from "node:path";
import { randomUUID, createHmac } from "node:crypto";

const DATA_DIR     = path.join(process.cwd(), "data");
const TESTERS_FILE = path.join(DATA_DIR, "testers.json");
const TOKENS_FILE  = path.join(DATA_DIR, "build-tokens.json");
const META_FILE    = path.join(DATA_DIR, "apk-metadata.json");
const APK_DIR      = path.join(process.cwd(), "public", "apks");

// ─── Types ────────────────────────────────────────────────────────────────────

export type TokenStatus = "pending" | "active" | "expired" | "revoked";

export interface BuildToken {
  token:                string;
  projectId:            string;
  testerId:             string;
  status:               TokenStatus;
  lifetimeDays:         number;
  downloadUrlExpiresAt: string;       // ISO — 24h from creation
  firstActivatedAt:     string | null; // set on first heartbeat
  expiresAt:            string | null; // set on first heartbeat: firstActivatedAt + lifetimeDays
  lastHeartbeatAt:      string | null;
  renewalCount:         number;
  createdAt:            string;
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

// ─── Defaults (from manifest spec) ───────────────────────────────────────────

export const DEFAULT_TESTING = {
  apk_lifetime_days:           30,
  download_link_expiry_hours:  24,
  grace_period_offline_hours:  48,
  expiry_action:               "block" as const,
  renewal_enabled:             true,
  max_renewals_per_tester:     2,
  warning_days_before:         5,
};

// ─── File helpers ─────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")) as T; }
  catch { return fallback; }
}

function writeJson(file: string, data: unknown) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

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

export function getApkPublicUrl(projectId: string, filename: string): string {
  return `/apks/${projectId}/${filename}`;
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

function saveToken(token: BuildToken) {
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
  const dlExpiry = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

  const bt: BuildToken = {
    token:                randomUUID(),
    projectId,
    testerId,
    status:               "pending",
    lifetimeDays,
    downloadUrlExpiresAt: dlExpiry.toISOString(),
    firstActivatedAt:     null,
    expiresAt:            null,
    lastHeartbeatAt:      null,
    renewalCount:         0,
    createdAt:            now.toISOString(),
  };

  saveToken(bt);
  return bt;
}

/** Called by Android heartbeat — activates on first call, checks expiry thereafter. */
export function validateToken(token: string): {
  ok: boolean;
  status: TokenStatus;
  daysRemaining: number | null;
  message: string;
} {
  const bt = getToken(token);
  if (!bt) return { ok: false, status: "revoked", daysRemaining: null, message: "token no encontrado" };

  if (bt.status === "revoked") {
    return { ok: false, status: "revoked", daysRemaining: null, message: "acceso revocado por el administrador" };
  }

  const now = new Date();

  // First launch → activate
  if (bt.status === "pending" && !bt.firstActivatedAt) {
    const expiresAt = new Date(now.getTime() + bt.lifetimeDays * 24 * 60 * 60 * 1000);
    const updated: BuildToken = {
      ...bt,
      status:           "active",
      firstActivatedAt: now.toISOString(),
      expiresAt:        expiresAt.toISOString(),
      lastHeartbeatAt:  now.toISOString(),
    };
    saveToken(updated);
    return {
      ok:            true,
      status:        "active",
      daysRemaining: bt.lifetimeDays,
      message:       `entorno activado — ${bt.lifetimeDays} días de prueba`,
    };
  }

  // Check expiry
  if (bt.expiresAt && new Date(bt.expiresAt) < now) {
    if (bt.status !== "expired") saveToken({ ...bt, status: "expired" });
    return { ok: false, status: "expired", daysRemaining: 0, message: "periodo de prueba expirado" };
  }

  // Active heartbeat
  const msRemaining  = bt.expiresAt ? new Date(bt.expiresAt).getTime() - now.getTime() : 0;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
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

  let newExpiresAt: string;
  if (bt.expiresAt) {
    // Extend from current expiry date
    newExpiresAt = new Date(
      new Date(bt.expiresAt).getTime() + days * 24 * 60 * 60 * 1000
    ).toISOString();
  } else {
    // Not activated yet — extend from now
    newExpiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  const updated: BuildToken = {
    ...bt,
    status:       bt.status === "expired" ? "active" : bt.status,
    expiresAt:    newExpiresAt,
    renewalCount: bt.renewalCount + 1,
  };
  saveToken(updated);
  return updated;
}

// ─── Download URL validation ──────────────────────────────────────────────────

/** Checks if the 24h download window is still open */
export function isDownloadValid(token: string): { valid: boolean; meta: ApkMeta | null } {
  const bt = getToken(token);
  if (!bt) return { valid: false, meta: null };
  if (bt.status === "revoked") return { valid: false, meta: null };

  const expired = new Date(bt.downloadUrlExpiresAt) < new Date();
  if (expired) return { valid: false, meta: null };

  const meta = getApkMeta(bt.projectId);
  return { valid: !!meta, meta };
}

// ─── Presigned download URL (HMAC, no DB) ────────────────────────────────────

export function signDownloadToken(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("hex").slice(0, 16);
}

export function verifyDownloadSig(token: string, sig: string, secret: string): boolean {
  return signDownloadToken(token, secret) === sig;
}
