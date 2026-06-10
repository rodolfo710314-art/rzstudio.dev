"use client";

// Panel operativo del dashboard (doc Bloque 8): estado de integraciones,
// monitor de costos (Cost Governor), historial de actas y log del Juez de Hierro.

import { useEffect, useState, useCallback } from "react";

interface OpsData {
  integrations: {
    anthropic:   boolean;
    email:       boolean;
    github:      boolean;
    cron:        boolean;
    persistence: boolean;
  };
  usage: {
    projectId:     string;
    totalTokens:   number;
    budgetMonthly: number | null;
    pctUsed:       number | null;
    alert:         boolean;
  }[];
  actas: {
    id:          string;
    projectId:   string;
    resolution:  string;
    triggerUsed: string | null;
    createdAt:   string;
  }[];
  judgeLog: {
    ts:        string;
    projectId: string;
    approved:  boolean;
    reasons:   string[];
  }[];
}

const INTEGRATION_LABELS: Record<string, { name: string; hint: string }> = {
  anthropic:   { name: "anthropic api",      hint: "conecta la cuenta desde el panel superior" },
  email:       { name: "email (resend)",     hint: "configura RESEND_API_KEY y EMAIL_FROM" },
  github:      { name: "github api",         hint: "configura GITHUB_TOKEN" },
  cron:        { name: "cron scheduler",     hint: "configura CRON_SECRET + cloud scheduler" },
  persistence: { name: "storage persistente", hint: "monta bucket GCS y define RZ_DATA_DIR" },
};

const RESOLUTION_COLOR: Record<string, string> = {
  merged: "text-emerald-400",
  purged: "text-red-400",
  vetoed: "text-amber-400",
};

export function OpsPanel() {
  const [data, setData]       = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actaMd, setActaMd]   = useState<{ id: string; markdown: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ops");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function openActa(id: string) {
    const res = await fetch(`/api/admin/ops?acta=${id}`);
    if (res.ok) setActaMd(await res.json());
  }

  return (
    <div className="border border-[#1D140F]">
      {/* Header */}
      <div className="border-b border-[#1D140F] px-5 py-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400">
          operaciones — núcleo simbiótico
        </span>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-[9px] uppercase tracking-widest font-mono text-slate-600 hover:text-[#C97352] transition-colors disabled:opacity-40"
        >
          {loading ? "cargando..." : "↺ refrescar"}
        </button>
      </div>

      {!data ? (
        <div className="p-5">
          <p className="text-xs font-mono text-slate-600 lowercase animate-pulse">consultando estado operativo...</p>
        </div>
      ) : (
        <div className="divide-y divide-[#1D140F]">
          {/* Integraciones */}
          <div className="p-5">
            <span className="text-[9px] uppercase tracking-widest font-mono text-slate-600 block mb-3">
              // integraciones
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(data.integrations).map(([key, active]) => {
                const meta = INTEGRATION_LABELS[key];
                return (
                  <div key={key} className="border border-[#1D140F] px-3 py-2 flex items-center gap-2.5">
                    <span
                      className={`w-1.5 h-1.5 shrink-0 ${active ? "bg-emerald-400" : "bg-slate-700"}`}
                      style={active ? { boxShadow: "0 0 5px rgba(52,211,153,0.6)" } : undefined}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-white lowercase">{meta?.name ?? key}</div>
                      {!active && (
                        <div className="text-[8px] font-mono text-slate-700 lowercase truncate">{meta?.hint}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Governor */}
          <div className="p-5">
            <span className="text-[9px] uppercase tracking-widest font-mono text-slate-600 block mb-3">
              // cost governor — consumo del mes
            </span>
            {data.usage.length === 0 ? (
              <p className="text-[10px] font-mono text-slate-700 lowercase">sin consumo registrado este mes</p>
            ) : (
              <div className="space-y-2">
                {data.usage.map((u) => (
                  <div key={u.projectId} className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-slate-500 w-10 shrink-0">[{u.projectId}]</span>
                    <div className="flex-1 h-1.5 bg-[#111] border border-[#1D140F]">
                      <div
                        className={`h-full ${u.alert ? "bg-red-500" : "bg-[#C97352]"}`}
                        style={{ width: `${Math.min(100, u.pctUsed ?? 0)}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-mono w-32 text-right ${u.alert ? "text-red-400" : "text-slate-400"}`}>
                      {u.totalTokens.toLocaleString()}{u.budgetMonthly ? ` / ${u.budgetMonthly.toLocaleString()}` : ""} tk
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actas */}
          <div className="p-5">
            <span className="text-[9px] uppercase tracking-widest font-mono text-slate-600 block mb-3">
              // actas de simbiosis — historial del war room
            </span>
            {data.actas.length === 0 ? (
              <p className="text-[10px] font-mono text-slate-700 lowercase">sin sesiones documentadas aún</p>
            ) : (
              <div className="space-y-1">
                {data.actas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => openActa(a.id)}
                    className="w-full flex items-center gap-3 text-left px-2 py-1.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-[9px] font-mono text-slate-600">[{a.projectId}]</span>
                    <span className={`text-[9px] font-mono uppercase ${RESOLUTION_COLOR[a.resolution] ?? "text-slate-500"}`}>
                      {a.resolution}
                    </span>
                    <span className="text-[9px] font-mono text-slate-700">{a.triggerUsed ?? "—"}</span>
                    <span className="text-[9px] font-mono text-slate-700 ml-auto">
                      {new Date(a.createdAt).toLocaleString("es-MX")}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600">{a.id} →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Juez de Hierro */}
          <div className="p-5">
            <span className="text-[9px] uppercase tracking-widest font-mono text-slate-600 block mb-3">
              // log del juez de hierro
            </span>
            {data.judgeLog.length === 0 ? (
              <p className="text-[10px] font-mono text-slate-700 lowercase">sin evaluaciones registradas</p>
            ) : (
              <div className="space-y-2">
                {data.judgeLog.map((j, i) => (
                  <div key={i} className="border-l border-[#1D140F] pl-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-mono ${j.approved ? "text-emerald-400" : "text-red-400"}`}>
                        {j.approved ? "✓ aprobado" : "⊘ vetado"}
                      </span>
                      <span className="text-[9px] font-mono text-slate-600">[{j.projectId}]</span>
                      <span className="text-[9px] font-mono text-slate-700">
                        {new Date(j.ts).toLocaleString("es-MX")}
                      </span>
                    </div>
                    {j.reasons.map((r, k) => (
                      <div key={k} className="text-[9px] font-mono text-slate-600 lowercase">— {r}</div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visor de acta */}
      {actaMd && (
        <div
          className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setActaMd(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-zinc-950 border border-slate-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] uppercase tracking-widest font-mono text-[#C97352]">
                // acta de simbiosis — {actaMd.id}
              </span>
              <button
                onClick={() => setActaMd(null)}
                className="text-[9px] uppercase tracking-widest font-mono text-slate-600 hover:text-slate-300"
              >
                cerrar ✕
              </button>
            </div>
            <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {actaMd.markdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
