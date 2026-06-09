import { validateToken, getToken, getApkMeta, isDownloadValid } from "@/lib/apk-store";
import { PROJECTS } from "@/components/simbiosis/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "rzstudio // activar entorno de pruebas",
  robots: { index: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function ActivatePage({ params }: Props) {
  const { token } = await params;

  const bt = getToken(token);
  if (!bt) return <ErrorScreen message="token no encontrado o inválido" />;

  const result    = validateToken(token);
  const meta      = getApkMeta(bt.projectId);
  const { valid } = isDownloadValid(token);
  const project   = PROJECTS.find((p) => p.id === bt.projectId);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-slate-800 bg-zinc-950">
        {/* Header */}
        <div className="border-b border-slate-800 px-6 py-4">
          <span className="font-mono text-[8px] text-[#C97352] uppercase tracking-widest block mb-0.5">
            // rzstudio // entorno de pruebas beta
          </span>
          <h1 className="font-mono text-sm text-white lowercase">
            {project?.name ?? bt.projectId}
          </h1>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Status indicator */}
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 shrink-0 ${
                result.status === "active"  ? "bg-emerald-400" :
                result.status === "pending" ? "bg-amber-400"   :
                result.status === "expired" ? "bg-red-500"     : "bg-slate-700"
              }`}
              style={result.status === "active" ? { boxShadow: "0 0 6px rgba(52,211,153,0.7)" } : undefined}
            />
            <span className="font-mono text-xs text-white lowercase">{result.message}</span>
          </div>

          {/* Token details */}
          <div className="space-y-0 border border-slate-800/50">
            <Row label="estado"   value={result.status} />
            {result.daysRemaining !== null && (
              <Row label="días restantes" value={`${result.daysRemaining} días`} highlight={result.daysRemaining <= 5} />
            )}
            {bt.firstActivatedAt && (
              <Row
                label="activado"
                value={new Date(bt.firstActivatedAt).toLocaleDateString("es-MX")}
              />
            )}
            {bt.expiresAt && (
              <Row
                label="expira"
                value={new Date(bt.expiresAt).toLocaleDateString("es-MX")}
              />
            )}
            {meta && <Row label="versión" value={`v${meta.version}`} />}
          </div>

          {/* Download if still valid */}
          {valid && meta && (
            <a
              href={`/api/v1/build/download?t=${token}`}
              className="flex items-center justify-center gap-2 w-full bg-emerald-950 border border-emerald-800
                         text-emerald-400 font-mono text-[9px] uppercase tracking-widest py-3
                         hover:bg-emerald-900 transition-colors"
            >
              ↓ descargar binario — {meta.filename}
            </a>
          )}

          {!valid && result.status !== "revoked" && (
            <div className="font-mono text-[9px] text-slate-700 border border-slate-800/50 p-3 leading-relaxed">
              {">"} el enlace de descarga expiró (24h). si tu app ya está instalada, el token sigue vigente.
              si necesitas reinstalar, contacta al administrador de rzstudio.
            </div>
          )}

          {result.status === "expired" && (
            <div className="font-mono text-[9px] text-amber-600/70 border border-amber-900/40 p-3 leading-relaxed">
              {">"} tu periodo de prueba ha finalizado. solicita una renovación respondiendo
              el correo de seguimiento que recibiste.
            </div>
          )}

          {result.status === "revoked" && (
            <div className="font-mono text-[9px] text-red-500/70 border border-red-900/40 p-3 leading-relaxed">
              {">"} este token ha sido revocado por el administrador. contacta a rzstudio para más información.
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-800 pt-4">
            <p className="font-mono text-[9px] text-slate-700 lowercase leading-relaxed">
              binario firmado con clave rz-studio-2026. verifica la firma antes de instalar.
              compatible con android 11+. <a href="/simbiosis" className="text-slate-500 hover:text-[#C97352] transition-colors">← volver al laboratorio</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-800/50 px-4 py-2 last:border-0">
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">{label}</span>
      <span className={`font-mono text-[10px] lowercase ${highlight ? "text-amber-400" : "text-slate-300"}`}>
        {value}
      </span>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm border border-red-900/40 bg-zinc-950 px-6 py-8 text-center space-y-3">
        <span className="w-2 h-2 bg-red-500 inline-block" />
        <p className="font-mono text-xs text-red-400 lowercase">{message}</p>
        <a href="/simbiosis" className="font-mono text-[9px] text-slate-600 hover:text-[#C97352] transition-colors block">
          ← volver al laboratorio
        </a>
      </div>
    </main>
  );
}
