"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PROJECTS } from "@/components/simbiosis/data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApkMeta {
  projectId: string; filename: string; originalName: string;
  size: number; version: string; uploadedAt: string;
}

type TokenStatus = "pending" | "active" | "expired" | "revoked";

interface EnrichedToken {
  token: string; projectId: string; testerId: string;
  status: TokenStatus; lifetimeDays: number;
  downloadUrlExpiresAt: string;
  firstActivatedAt: string | null; expiresAt: string | null;
  lastHeartbeatAt: string | null; renewalCount: number; createdAt: string;
  daysRemaining: number | null;
  tester: { nombre: string; email: string; rol: string } | null;
}

function fmt(b: number) {
  return b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

const STATUS_COLOR: Record<TokenStatus, string> = {
  active:  "text-emerald-400",
  pending: "text-amber-400",
  expired: "text-slate-500",
  revoked: "text-red-800",
};

const ANDROID_PROJECTS = PROJECTS.filter(
  (p) => p.platform === "android" || p.platform === "both"
);

// ─── Main component ───────────────────────────────────────────────────────────

export function ApkManager() {
  const [metas,   setMetas]   = useState<ApkMeta[]>([]);
  const [tokens,  setTokens]  = useState<EnrichedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress,  setProgress]  = useState<number>(0);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const versionRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([
        fetch("/api/admin/apk").then((r) => r.json()),
        fetch("/api/v1/build/tokens").then((r) => r.json()),
      ]);
      setMetas(Array.isArray(m) ? m : []);
      setTokens(Array.isArray(t) ? t : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Subida con progreso: XHR PUT directo a la sesión resumable de GCS.
  function xhrPutWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", "application/vnd.android.package-archive");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300)
        ? resolve()
        : reject(new Error(`gcs respondió ${xhr.status}`));
      xhr.onerror   = () => reject(new Error("error de red durante la subida"));
      xhr.ontimeout = () => reject(new Error("timeout de subida"));
      xhr.send(file);
    });
  }

  async function handleUpload(projectId: string) {
    const input   = fileInputs.current[projectId];
    const version = (versionRefs.current[projectId]?.value ?? "1.0.0").trim() || "1.0.0";
    const file    = input?.files?.[0];
    if (!file) return;

    setUploading(projectId); setMsg(null); setProgress(0);

    try {
      // Paso 1: pedir la sesión de subida
      const signRes = await fetch("/api/admin/apk/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, version, filename: file.name }),
      });
      const sign = await signRes.json();
      if (signRes.status === 401) {
        setMsg({ ok: false, text: "sesión expirada — recarga la página e inicia sesión de nuevo" });
        return;
      }
      if (!signRes.ok) {
        setMsg({ ok: false, text: sign.error ?? "no se pudo iniciar la subida" });
        return;
      }

      if (sign.mode === "gcs") {
        // Paso 2: el archivo va DIRECTO al bucket (no pasa por el servidor)
        await xhrPutWithProgress(sign.uploadUrl, file, setProgress);

        // Paso 3: confirmar — el servidor verifica el objeto y registra la metadata
        const confRes = await fetch("/api/admin/apk/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: sign.projectId,
            filename:  sign.filename,
            version:   sign.version,
            originalName: file.name,
          }),
        });
        const conf = await confRes.json();
        if (!confRes.ok || !conf.ok) {
          setMsg({ ok: false, text: conf.error ?? "la subida no se pudo confirmar" });
          return;
        }
        setMsg({ ok: true, text: `✓ subido — ${conf.meta.filename} (${fmt(conf.meta.size)})` });
      } else {
        // Dev local sin GCS: multipart clásico (límite 30 MB)
        const fd = new FormData();
        fd.append("apk", file);
        fd.append("projectId", projectId);
        fd.append("version", version);
        const res  = await fetch("/api/admin/apk", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setMsg({ ok: false, text: data.error ?? "error al subir" });
          return;
        }
        setMsg({ ok: true, text: `✓ subido — ${data.meta.filename}` });
      }

      if (input) input.value = "";
      await refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message ?? "error de red" });
    } finally {
      setUploading(null);
      setProgress(0);
    }
  }

  async function handleDeleteApk(projectId: string) {
    setDeleting(projectId); setMsg(null);
    try {
      const res  = await fetch(`/api/admin/apk?projectId=${projectId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) { setMsg({ ok: false, text: data.error ?? "error al eliminar" }); }
      else { setMsg({ ok: true, text: "APK eliminado" }); await refresh(); }
    } catch { setMsg({ ok: false, text: "error de red" }); }
    finally  { setDeleting(null); }
  }

  async function handleRevoke(token: string) {
    setMsg(null);
    try {
      const res  = await fetch("/api/v1/build/revoke", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setMsg({ ok: false, text: data.error ?? "error al revocar" }); }
      else { setMsg({ ok: true, text: "token revocado" }); await refresh(); }
    } catch { setMsg({ ok: false, text: "error de red" }); }
  }

  async function handleExtend(token: string, days: number) {
    setMsg(null);
    try {
      const res  = await fetch("/api/v1/build/extend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, days }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setMsg({ ok: false, text: data.error ?? "error al extender" }); }
      else { setMsg({ ok: true, text: `token extendido +${days} días` }); await refresh(); }
    } catch { setMsg({ ok: false, text: "error de red" }); }
  }

  return (
    <div className="border border-[#1D140F] space-y-0">
      {/* Header */}
      <div className="border-b border-[#1D140F] px-5 py-3 flex items-center justify-between">
        <span className="text-[12px] uppercase tracking-widest font-mono text-slate-400">
          distribución android — binarios + tokens de acceso
        </span>
        <button onClick={refresh} disabled={loading}
          className="text-[11px] uppercase tracking-widest font-mono text-slate-500 hover:text-[#C97352] transition-colors disabled:opacity-40">
          {loading ? "cargando..." : "↺ refrescar"}
        </button>
      </div>

      {msg && (
        <div className={`px-5 py-2 border-b border-[#1D140F] text-xs font-mono lowercase ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* APK rows */}
      <div className="divide-y divide-[#1D140F]">
        {ANDROID_PROJECTS.map((project) => {
          const meta     = metas.find((m) => m.projectId === project.id);
          const ptTokens = tokens.filter((t) => t.projectId === project.id);
          const busy     = uploading === project.id || deleting === project.id;

          return (
            <ApkRow
              key={project.id}
              project={project}
              meta={meta ?? null}
              tokens={ptTokens}
              busy={busy}
              progress={uploading === project.id ? progress : null}
              onUpload={() => handleUpload(project.id)}
              onDeleteApk={() => handleDeleteApk(project.id)}
              onRevoke={handleRevoke}
              onExtend={handleExtend}
              fileInputRef={(el) => { fileInputs.current[project.id] = el; }}
              versionRef={(el)   => { versionRefs.current[project.id] = el; }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── APK row ──────────────────────────────────────────────────────────────────

interface ApkRowProps {
  project:      { id: string; name: string; platform: string };
  meta:         ApkMeta | null;
  tokens:       EnrichedToken[];
  busy:         boolean;
  progress:     number | null;
  onUpload:     () => void;
  onDeleteApk:  () => void;
  onRevoke:     (token: string) => void;
  onExtend:     (token: string, days: number) => void;
  fileInputRef: (el: HTMLInputElement | null) => void;
  versionRef:   (el: HTMLInputElement | null) => void;
}

function ApkRow({ project, meta, tokens, busy, progress, onUpload, onDeleteApk, onRevoke, onExtend, fileInputRef, versionRef }: ApkRowProps) {
  // Sin APK → el formulario de carga queda visible de inmediato (sin clics extra)
  const [showUpload, setShowUpload] = useState(!meta);
  const [showTokens, setShowTokens] = useState(false);
  const [fileName,   setFileName]   = useState<string | null>(null);
  const [fileSize,   setFileSize]   = useState<number>(0);
  const [fileError,  setFileError]  = useState<string | null>(null);

  // Si el APK se purga, reabrir el formulario; si se sube, colapsarlo
  useEffect(() => { setShowUpload(!meta); }, [meta?.filename]);

  function handleFilePick(file: File | null) {
    setFileError(null);
    if (!file) { setFileName(null); setFileSize(0); return; }
    if (!file.name.toLowerCase().endsWith(".apk")) {
      setFileError("el archivo debe tener extensión .apk");
      setFileName(null); setFileSize(0);
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);
    // Arranque automático: elegir archivo = iniciar subida (sin pasos extra)
    onUpload();
  }

  const active  = tokens.filter((t) => t.status === "active").length;
  const pending = tokens.filter((t) => t.status === "pending").length;

  return (
    <div className="divide-y divide-[#1D140F]">
      {/* Project summary */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-mono text-slate-500">[{project.id}]</span>
          <span className="text-xs font-mono text-white lowercase truncate">{project.name}</span>
          <span className="text-[10px] font-mono text-slate-500 border border-[#1D140F] px-1.5 py-0.5 uppercase shrink-0">
            {project.platform}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {meta ? (
            <>
              <span className="text-[11px] font-mono text-emerald-400">✓ v{meta.version} — {fmt(meta.size)}</span>
              <span className="text-[11px] font-mono text-slate-500">
                {active}a / {pending}p / {tokens.length} total
              </span>
              {tokens.length > 0 && (
                <button onClick={() => setShowTokens((v) => !v)}
                  className="text-[11px] uppercase tracking-widest font-mono text-slate-500 hover:text-[#C97352] transition-colors">
                  {showTokens ? "ocultar tokens" : "ver tokens"}
                </button>
              )}
              <button onClick={onDeleteApk} disabled={busy}
                className="text-[11px] uppercase tracking-widest font-mono text-red-900 hover:text-red-500 transition-colors disabled:opacity-40">
                purgar APK
              </button>
            </>
          ) : (
            <span className="text-[11px] font-mono text-slate-500">sin APK</span>
          )}
          <button onClick={() => setShowUpload((v) => !v)}
            className="text-[11px] uppercase tracking-widest font-mono text-slate-500 hover:text-[#C97352] transition-colors border border-[#333] px-2 py-1">
            {meta ? "reemplazar APK" : "subir APK"}
          </button>
        </div>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="px-5 py-4 bg-black/20 space-y-3">
          {/* Paso 1: versión (antes de elegir el archivo — la subida arranca al elegirlo) */}
          <div className="flex items-center gap-3">
            <label className="text-[11px] uppercase tracking-widest text-slate-500 font-mono shrink-0">
              1 · versión
            </label>
            <input ref={versionRef} type="text" defaultValue="1.0.0" placeholder="1.0.0"
              disabled={busy}
              className="bg-[#111] border border-[#333] px-2 py-1.5 text-xs font-mono text-white w-28 focus:outline-none focus:border-[#C97352] transition-colors disabled:opacity-40" />
            <span className="text-[11px] font-mono text-slate-500 lowercase">
              2 · elige el archivo — la subida inicia automáticamente
            </span>
          </div>

          {/* Zona de carga prominente — clic en cualquier parte abre el selector */}
          <label
            className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#555] px-6 py-6
                       cursor-pointer hover:border-[#C97352] hover:bg-[#C97352]/5 transition-colors"
          >
            {busy ? (
              <>
                <span className="text-sm font-mono text-[#C97352] animate-pulse">⬆ subiendo {fileName ?? "archivo"}...</span>
                <span className="text-[11px] font-mono text-slate-500">{progress ?? 0}% de {fmt(fileSize)} — no cierres esta pestaña</span>
              </>
            ) : fileName ? (
              <>
                <span className="text-sm font-mono text-emerald-400">✓ {fileName}</span>
                <span className="text-[11px] font-mono text-slate-500">{fmt(fileSize)}</span>
              </>
            ) : (
              <>
                <span className="text-sm font-mono text-[#C97352]">⬆ seleccionar archivo .apk</span>
                <span className="text-[11px] font-mono text-slate-500 lowercase">
                  haz clic aquí para elegir el binario — soporta archivos de varios GB
                </span>
              </>
            )}
            <input
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
            />
          </label>

          {fileError && (
            <p className="text-xs font-mono text-red-400 lowercase">✗ {fileError}</p>
          )}

          {busy && progress !== null && (
            <div className="space-y-1">
              <div className="h-1.5 bg-[#111] border border-[#1D140F]">
                <div className="h-full bg-[#C97352] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] font-mono text-slate-500 lowercase">
                subiendo directo al bucket — {progress}% · no cierres esta pestaña
              </p>
            </div>
          )}

          <div className="flex items-end gap-3 flex-wrap">
            {fileName && !busy && (
              <button onClick={() => onUpload()}
                className="border border-[#C97352] px-5 py-2 text-[11px] uppercase tracking-widest font-mono text-[#C97352]
                           hover:bg-[#C97352] hover:text-black transition-colors">
                reintentar subida
              </button>
            )}
            {meta && (
              <button onClick={() => { setShowUpload(false); setFileName(null); setFileError(null); }}
                className="text-[11px] uppercase font-mono text-slate-500 hover:text-slate-400 transition-colors">
                cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Token table */}
      {showTokens && tokens.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-[#1D140F]">
                {["tester", "email", "rol", "estado", "días restantes", "activado", "expira", "acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.token} className="border-b border-[#1D140F] hover:bg-white/[0.01]">
                  <td className="px-4 py-2 text-white lowercase">{t.tester?.nombre ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-400">{t.tester?.email ?? "—"}</td>
                  <td className="px-4 py-2 text-[#C97352] lowercase">{t.tester?.rol ?? "—"}</td>
                  <td className={`px-4 py-2 ${STATUS_COLOR[t.status]}`}>{t.status}</td>
                  <td className={`px-4 py-2 ${t.daysRemaining !== null && t.daysRemaining <= 5 ? "text-amber-400" : "text-slate-400"}`}>
                    {t.daysRemaining !== null ? `${t.daysRemaining}d` : "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {t.firstActivatedAt ? new Date(t.firstActivatedAt).toLocaleDateString("es-MX") : "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString("es-MX") : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {t.status !== "revoked" && (
                        <button onClick={() => onRevoke(t.token)}
                          className="text-red-900 hover:text-red-500 transition-colors uppercase tracking-widest">
                          revocar
                        </button>
                      )}
                      {(t.status === "active" || t.status === "expired") && (
                        <button onClick={() => onExtend(t.token, 30)}
                          className="text-slate-500 hover:text-[#C97352] transition-colors uppercase tracking-widest">
                          +30d
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
