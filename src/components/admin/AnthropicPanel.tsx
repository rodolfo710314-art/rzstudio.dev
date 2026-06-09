"use client";

import { useEffect, useState, useActionState } from "react";
import { updateAnthropicKey } from "@/app/admin/anthropic-actions";
import type { KeyUpdateState } from "@/app/admin/anthropic-actions";

interface AnthropicStatus {
  connected: boolean;
  key_masked?: string;
  plan_tier?: "free" | "build" | "scale" | "enterprise";
  rpm_limit?: number;
  tpm_limit?: number;
  validated_at?: string;
  error?: string;
}

const PLAN_COLORS: Record<string, string> = {
  free:       "text-slate-400",
  build:      "text-[#C97352]",
  scale:      "text-emerald-400",
  enterprise: "text-blue-400",
};

const PLAN_LABELS: Record<string, string> = {
  free:       "free",
  build:      "build  (pay-as-you-go)",
  scale:      "scale",
  enterprise: "enterprise",
};

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 shrink-0 ${connected ? "bg-emerald-400" : "bg-slate-600"}`}
      style={connected ? { boxShadow: "0 0 6px rgba(52,211,153,0.7)" } : undefined}
    />
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#1D140F] py-2">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono whitespace-nowrap">
        {label}
      </span>
      <span className="text-xs font-mono text-white lowercase truncate text-right">{value}</span>
    </div>
  );
}

const initialState: KeyUpdateState = {};

export function AnthropicPanel() {
  const [status, setStatus]         = useState<AnthropicStatus | null>(null);
  const [statusLoading, setLoading] = useState(true);
  const [showForm, setShowForm]     = useState(false);

  const [state, action, isPending] = useActionState(updateAnthropicKey, initialState);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/anthropic/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false, error: "error al consultar el estado" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStatus(); }, []);

  // Refresh status after a successful key update
  useEffect(() => {
    if (state?.ok) {
      setShowForm(false);
      fetchStatus();
    }
  }, [state]);

  return (
    <div className="border border-[#1D140F]">
      {/* Header */}
      <div className="border-b border-[#1D140F] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusLoading ? (
            <span className="w-2 h-2 bg-slate-600 animate-pulse" />
          ) : (
            <StatusDot connected={status?.connected ?? false} />
          )}
          <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400">
            anthropic api — claude sonnet 4.6
          </span>
        </div>
        <button
          onClick={fetchStatus}
          disabled={statusLoading}
          className="text-[9px] uppercase tracking-widest font-mono text-slate-600 hover:text-[#C97352] transition-colors disabled:opacity-40"
        >
          {statusLoading ? "verificando..." : "↺ verificar"}
        </button>
      </div>

      {/* Status */}
      <div className="p-5 space-y-1">
        {statusLoading ? (
          <p className="text-xs font-mono text-slate-600 lowercase animate-pulse">consultando estado...</p>
        ) : status?.connected ? (
          <>
            <MetaRow label="estado"     value="✓ conectado" />
            {status.key_masked   && <MetaRow label="api key"    value={status.key_masked} />}
            {status.plan_tier    && (
              <div className="flex items-baseline justify-between gap-4 border-b border-[#1D140F] py-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">plan</span>
                <span className={`text-xs font-mono lowercase ${PLAN_COLORS[status.plan_tier] ?? "text-white"}`}>
                  {PLAN_LABELS[status.plan_tier] ?? status.plan_tier}
                </span>
              </div>
            )}
            {status.rpm_limit    && <MetaRow label="rpm (sonnet)" value={`${status.rpm_limit.toLocaleString()} req/min`} />}
            {status.tpm_limit    && <MetaRow label="tpm (sonnet)" value={`${status.tpm_limit.toLocaleString()} tokens/min`} />}
            {status.validated_at && (
              <MetaRow
                label="última verificación"
                value={new Date(status.validated_at).toLocaleString("es-MX")}
              />
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">estado</span>
            <span className="text-xs font-mono text-red-400 lowercase">
              ✗ {status?.error ?? "sin conexión"}
            </span>
          </div>
        )}
      </div>

      {/* Key update form */}
      <div className="border-t border-[#1D140F] p-5 space-y-3">
        {showForm && (
          <form action={action} className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="api-key-input"
                className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono"
              >
                api key de anthropic console
              </label>
              <input
                id="api-key-input"
                name="api_key"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="sk-ant-api03-..."
                className="w-full bg-[#111111] border border-[#333] px-3 py-2 text-xs font-mono text-white
                           focus:outline-none focus:border-[#C97352] transition-colors placeholder:text-slate-600"
              />
              <p className="text-[9px] font-mono text-slate-600 lowercase">
                obtén tu key en{" "}
                <span className="text-slate-400">console.anthropic.com → api keys</span>
              </p>
            </div>

            {state?.error && (
              <p className="text-xs font-mono text-red-400 lowercase">✗ {state.error}</p>
            )}
            {state?.ok && (
              <p className="text-xs font-mono text-emerald-400 lowercase">
                ✓ cuenta conectada — {state.key_masked}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="border border-[#C97352] px-4 py-2 text-[10px] uppercase tracking-widest font-mono text-[#C97352]
                           hover:bg-[#C97352] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "conectando..." : "conectar cuenta"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[10px] uppercase tracking-widest font-mono text-slate-600 hover:text-slate-400 transition-colors"
              >
                cancelar
              </button>
            </div>
          </form>
        )}

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="border border-[#C97352] px-4 py-2 text-[10px] uppercase tracking-widest font-mono text-[#C97352]
                       hover:bg-[#C97352] hover:text-black transition-colors"
          >
            {status?.connected ? "cambiar key" : "conectar cuenta"}
          </button>
        )}

        {status?.connected && status.plan_tier === "build" && !showForm && (
          <p className="text-[10px] font-mono text-slate-600 lowercase leading-relaxed">
            plan build activo — sube a scale cuando los logs muestren errores 429 frecuentes
          </p>
        )}
      </div>
    </div>
  );
}
