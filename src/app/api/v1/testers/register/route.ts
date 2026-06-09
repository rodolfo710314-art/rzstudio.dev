import { NextRequest, NextResponse } from "next/server";
import {
  getApkMeta,
  getTesterByEmail,
  saveTester,
  createBuildToken,
  listTesterTokens,
  DEFAULT_TESTING,
} from "@/lib/apk-store";
import { randomUUID } from "node:crypto";

// POST /api/v1/testers/register
// Body: { nombre, email, rol, projectId }
// Returns: { token, downloadUrl, downloadExpiresAt, lifetimeDays, isNewTester }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const nombre    = (body.nombre    as string | undefined)?.trim() ?? "";
  const email     = (body.email     as string | undefined)?.trim() ?? "";
  const rol       = (body.rol       as string | undefined)?.trim() ?? "";
  const projectId = (body.projectId as string | undefined)?.trim() ?? "";

  if (!nombre || !email || !rol || !projectId) {
    return NextResponse.json(
      { error: "nombre, email, rol y projectId son requeridos" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "email inválido" }, { status: 400 });
  }

  const meta = getApkMeta(projectId);
  if (!meta) {
    return NextResponse.json(
      { error: "no hay APK disponible para este proyecto" },
      { status: 404 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;

  // Get or create tester
  let tester = getTesterByEmail(email);
  const isNewTester = !tester;

  if (!tester) {
    tester = saveTester({
      id:        randomUUID(),
      email,
      nombre,
      rol,
      ip,
      createdAt: new Date().toISOString(),
    });
  }

  // Check if tester already has an active/pending token for this project
  const existingTokens = listTesterTokens(tester.id, projectId);
  const activeToken = existingTokens.find(
    (t) => t.status === "active" || t.status === "pending"
  );

  if (activeToken) {
    const dlValid = new Date(activeToken.downloadUrlExpiresAt) > new Date();
    return NextResponse.json({
      token:              activeToken.token,
      downloadUrl:        `/api/v1/build/download?t=${activeToken.token}`,
      downloadExpiresAt:  activeToken.downloadUrlExpiresAt,
      lifetimeDays:       activeToken.lifetimeDays,
      status:             activeToken.status,
      isNewTester:        false,
      isExistingToken:    true,
      downloadExpired:    !dlValid,
      message:            dlValid
        ? "ya tienes un token activo para este proyecto"
        : "tu token existe pero el enlace de descarga expiró — el token sigue válido",
    });
  }

  // Create new build token
  const buildToken = createBuildToken(
    projectId,
    tester.id,
    DEFAULT_TESTING.apk_lifetime_days,
    DEFAULT_TESTING.download_link_expiry_hours,
  );

  return NextResponse.json({
    token:             buildToken.token,
    downloadUrl:       `/api/v1/build/download?t=${buildToken.token}`,
    downloadExpiresAt: buildToken.downloadUrlExpiresAt,
    lifetimeDays:      buildToken.lifetimeDays,
    status:            buildToken.status,
    isNewTester,
    isExistingToken:   false,
    message:           `token creado — el enlace de descarga expira en ${DEFAULT_TESTING.download_link_expiry_hours}h`,
  });
}
