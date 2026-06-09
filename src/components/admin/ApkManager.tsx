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
  expired: "text-slate-600",
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

  async function handleUpload(projectId: string) {
    const input   = fileInputs.current[projectId];
    const version = (versionRefs.current[projectId]?.value ?? "1.0.0").trim() || "1.0.0";
    if (!input?.files?.[0]) return;

    setUploading(projectId); setMsg(null);
    const fd = new FormData();
    fd.append("apk", input.files[0]);
    fd.append("projectId", projectId);
    fd.append("version", version);

    try {
      const res  = await fetch("/api/admin/apk", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg({ ok: false, text: data.error ?? "error al subir" });
      } else {
        setMsg({ ok: true, text: `✓ subido — ${data.meta.filename}` });
        input.value = "";
        await refresh();
      }
    } catch { setMsg({ ok: false, text: "error de red" }); }
    finally  { setUploading(null); }
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
        <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400">
          distribución android — binarios + tokens de acceso
        </span>
        <button onClick={refresh} disabled={loading}
          className="text-[9px] uppercase tracking-widest font-mono text-slate-600 hover:text-[#C97352] transition-colors disabled:opacity-40">
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
  onUpload:     () => void;
  onDeleteApk:  () => void;
  onRevoke:     (token: string) => void;
  onExtend:     (token: string, days: number) => void;
  fileInputRef: (el: HTMLInputElement | null) => void;
  versionRef:   (el: HTMLInputElement | null) => void;
}

function ApkRow({ project, meta, tokens, busy, onUpload, onDeleteApk, onRevoke, onExtend, fileInputRef, versionRef }: ApkRowProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [fileName,   setFileName]   = useState<string | null>(null);

  const active  = tokens.filter((t) => t.status === "active").length;
  const pending = tokens.filter((t) => t.status === "pending").length;

  return (
    <div className="divide-y divide-[#1D140F]">
      {/* Project summary */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[8px] font-mono text-slate-700">[{project.id}]</span>
          <span className="text-xs font-mono text-white lowercase truncate">{project.name}</span>
          <span className="text-[8px] font-mono text-slate-700 border border-[#1D140F] px-1.5 py-0.5 uppercase shrink-0">
            {project.platform}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {meta ? (
            <>
              <span className="text-[9px] font-mono text-emerald-400">✓ v{meta.version} — {fmt(meta.size)}</span>
              <span className="text-[9px] font-mono text-slate-600">
                {active}a / {pending}p / {tokens.length} total
              </span>
              {tokens.length > 0 && (
                <button onClick={() => setShowTokens((v) => !v)}
                  className="text-[9px] uppercase tracking-widest font-mono text-slate-500 hover:text-[#C97352] transition-colors">
                  {showTokens ? "ocultar tokens" : "ver tokens"}
                </button>
              )}
              <button onClick={onDeleteApk} disabled={busy}
                className="text-[9px] uppercase tracking-widest font-mono text-red-900 hover:text-red-500 transition-colors disabled:opacity-40">
                purgar APK
              </button>
            </>
          ) : (
            <span className="text-[9px] font-mono text-slate-700">sin APK</span>
          )}
          <button onClick={() => setShowUpload((v) => !v)}
            className="text-[9px] uppercase tracking-widest font-mono text-slate-500 hover:text-[#C97352] transition-colors border border-[#333] px-2 py-1">
            {meta ? "reemplazar APK" : "subir APK"}
          </button>
        </div>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="px-5 py-3 bg-black/20 flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="block text-[9px] uppercase tracking-widest text-slate-600 font-mono">versión</label>
            <input ref={versionRef} type="text" defaultValue="1.0.0" placeholder="1.0.0"
              className="bg-[#111] border border-[#333] px-2 py-1 text-xs font-mono text-white w-24 focus:outline-none focus:border-[#C97352] transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] uppercase tracking-widest text-slate-600 font-mono">archivo .apk</label>
            <label className="flex items-center gap-2 border border-[#333] px-3 py-1.5 cursor-pointer hover:border-[#C97352] transition-colors">
              <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500">
                {fileName ?? "seleccionar archivo"}
              </span>
              <input type="file" accept=".apk" className="hidden" ref={fileInputRef}
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
            </label>
          </div>
          <button onClick={() => { onUpload(); setShowUpload(false); setFileName(null); }}
            disabled={busy || !fileName}
            className="border border-[#C97352] px-4 py-1.5 text-[9px] uppercase tracking-widest font-mono text-[#C97352]
                       hover:bg-[#C97352] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {busy ? "subiendo..." : "subir"}
          </button>
          <button onClick={() => { setShowUpload(false); setFileName(null); }}
            className="text-[9px] uppercase font-mono text-slate-700 hover:text-slate-400 transition-colors">
            cancelar
          </button>
        </div>
      )}

      {/* Token table */}
      {showTokens && tokens.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[9px] font-mono">
            <thead>
              <tr className="border-b border-[#1D140F]">
                {["tester", "email", "rol", "estado", "días restantes", "activado", "expira", "acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 uppercase tracking-widest text-slate-700 whitespace-nowrap">{h}</th>
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
                  <td className="px-4 py-2 text-slate-600">
                    {t.firstActivatedAt ? new Date(t.firstActivatedAt).toLocaleDateString("es-MX") : "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
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
