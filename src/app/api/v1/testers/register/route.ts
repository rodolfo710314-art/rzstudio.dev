import { NextRequest, NextResponse } from "next/server";
import {
  getApkMeta,
  getTesterByEmail,
  saveTester,
  createBuildToken,
  checkRegisterPolicy,
  DEFAULT_TESTING,
} from "@/lib/apk-store";
import { randomUUID } from "node:crypto";

// POST /api/v1/testers/register
// Body: { nombre, email, rol, projectId }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const nombre    = (body.nombre    as string | undefined)?.trim() ?? "";
  const email     = (body.email     as string | undefined)?.trim() ?? "";
  const rol       = (body.rol       as string | undefined)?.trim() ?? "";
  const projectId = (body.projectId as string | undefined)?.trim() ?? "";
  const consent   = body.consent === true;

  if (!nombre || !email || !rol || !projectId) {
    return NextResponse.json(
      { error: "nombre, email, rol y projectId son requeridos" },
      { status: 400 }
    );
  }

  if (!consent) {
    return NextResponse.json(
      { error: "debes aceptar el aviso de privacidad y los términos del programa beta" },
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

  // Política de registro: bloquea testers revocados y expirados sin renovaciones.
  // La renovación de un token expirado solo la otorga el admin (extend).
  const policy = checkRegisterPolicy(tester.id, projectId);
  if (!policy.allowed) {
    return NextResponse.json({ error: policy.message, reason: policy.reason }, { status: 403 });
  }

  if (policy.existing) {
    const t = policy.existing;
    const dlValid = new Date(t.downloadUrlExpiresAt) > new Date();
    return NextResponse.json({
      token:             t.token,
      downloadUrl:       `/api/v1/build/download?t=${t.token}`,
      downloadExpiresAt: t.downloadUrlExpiresAt,
      lifetimeDays:      t.lifetimeDays,
      status:            t.status,
      isNewTester:       false,
      isExistingToken:   true,
      downloadExpired:   !dlValid,
      message:           dlValid
        ? "ya tienes un token activo para este proyecto"
        : "tu token sigue válido pero el enlace de descarga expiró — contacta al administrador para reinstalar",
    });
  }

  const bt = createBuildToken(
    projectId,
    tester.id,
    DEFAULT_TESTING.apk_lifetime_days,
    DEFAULT_TESTING.download_link_expiry_hours,
  );

  return NextResponse.json({
    token:             bt.token,
    downloadUrl:       `/api/v1/build/download?t=${bt.token}`,
    downloadExpiresAt: bt.downloadUrlExpiresAt,
    lifetimeDays:      bt.lifetimeDays,
    status:            bt.status,
    isNewTester,
    isExistingToken:   false,
    message:           `token creado — el enlace de descarga expira en ${DEFAULT_TESTING.download_link_expiry_hours}h`,
  });
}
