// Cron de mantenimiento (doc §8.2 y §15.1) — pensado para Cloud Scheduler:
//   gcloud scheduler jobs create http rz-maintenance \
//     --schedule="0 */6 * * *" \
//     --uri="https://TU-DOMINIO/api/cron/maintenance" \
//     --headers="Authorization=Bearer ${CRON_SECRET}"
//
// Tareas: expira tokens vencidos, envía avisos (≤5 días), seguimiento 48h
// post-activación y notificación de bloqueo. Idempotente: cada correo se
// marca en el token para no reenviarse.

import { NextRequest, NextResponse } from "next/server";
import { listTokens, saveToken, getTester, DEFAULT_TESTING } from "@/lib/apk-store";
import { sendWarningEmail, sendFollowupEmail, sendExpiredEmail, emailConfigured } from "@/lib/email";
import { loadManifest } from "@/lib/manifest";
import { PROJECTS } from "@/components/simbiosis/data";

function projectName(projectId: string): string {
  return loadManifest(projectId)?.name
    ?? PROJECTS.find((p) => p.id === projectId)?.name
    ?? projectId;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const now = Date.now();
  const summary = { expired: 0, warnings: 0, followups: 0, expiredNotices: 0, emailEnabled: emailConfigured() };

  for (const original of listTokens()) {
    if (original.status === "revoked") continue;

    let t = { ...original }; // copia mutable — evita pisar campos al guardar dos veces en el mismo ciclo
    const tester = getTester(t.testerId);
    const name   = projectName(t.projectId);

    // 1. Expirar tokens vencidos
    if (t.status === "active" && t.expiresAt && new Date(t.expiresAt).getTime() < now) {
      t = { ...t, status: "expired" };
      saveToken(t);
      summary.expired++;

      if (tester && !t.expiredEmailSentAt && emailConfigured()) {
        const sent = await sendExpiredEmail(tester.email, name);
        if (sent) {
          t = { ...t, expiredEmailSentAt: new Date().toISOString() };
          saveToken(t);
          summary.expiredNotices++;
        }
      }
      continue;
    }

    if (t.status !== "active" || !t.expiresAt) continue;

    const daysLeft = Math.ceil((new Date(t.expiresAt).getTime() - now) / 86_400_000);

    // 2. Aviso de expiración (≤ warning_days_before, una sola vez)
    if (daysLeft <= DEFAULT_TESTING.warning_days_before && daysLeft > 0 && !t.warningEmailSentAt && tester && emailConfigured()) {
      const sent = await sendWarningEmail(tester.email, name, daysLeft, t.token);
      if (sent) {
        t = { ...t, warningEmailSentAt: new Date().toISOString() };
        saveToken(t);
        summary.warnings++;
      }
    }

    // 3. Seguimiento 48h después de la activación ("¿sobrevivió el código?")
    if (
      t.firstActivatedAt &&
      now - new Date(t.firstActivatedAt).getTime() >= 48 * 3_600_000 &&
      !t.followupEmailSentAt &&
      tester && emailConfigured()
    ) {
      const sent = await sendFollowupEmail(tester.email, name, t.token);
      if (sent) {
        t = { ...t, followupEmailSentAt: new Date().toISOString() };
        saveToken(t);
        summary.followups++;
      }
    }
  }

  return NextResponse.json({ ok: true, ran_at: new Date().toISOString(), ...summary });
}
