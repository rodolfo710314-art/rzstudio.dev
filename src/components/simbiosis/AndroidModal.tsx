"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Project } from "./data";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface AndroidModalProps {
  project: Project | null;
  onClose: () => void;
}

type Step = "check" | "form" | "token" | "unavailable";

interface TokenResult {
  token:             string;
  downloadUrl:       string;
  downloadExpiresAt: string;
  lifetimeDays:      number;
  status:            string;
  isExistingToken?:  boolean;
  downloadExpired?:  boolean;
  message?:          string;
}

const ROLES = [
  { value: "desarrollador", label: "Desarrollador / Técnico"         },
  { value: "inversor",      label: "Inversor / Cliente potencial"    },
  { value: "producto",      label: "Product Manager / Diseñador"     },
  { value: "curioso",       label: "Curioso / Explorador"            },
];

export function AndroidModal({ project, onClose }: AndroidModalProps) {
  const [step,       setStep]       = useState<Step>("check");
  const [form,       setForm]       = useState({ nombre: "", email: "", rol: "" });
  const [consent,    setConsent]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<TokenResult | null>(null);
  const closeRef   = useRef<HTMLButtonElement>(null);
  const trapRef    = useFocusTrap<HTMLDivElement>(!!project);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!project) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!project]);

  useEffect(() => {
    if (!project) return;
    setStep("check");
    setForm({ nombre: "", email: "", rol: "" });
    setConsent(false);
    setError(null);
    setResult(null);
    setTimeout(() => closeRef.current?.focus(), 50);

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    fetch(`/api/apk/${project.id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setStep(data.available ? "form" : "unavailable"); })
      .catch(() => { if (!cancelled) setStep("unavailable"); })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [project?.id]);

  function handleClose() {
    setStep("check");
    setForm({ nombre: "", email: "", rol: "" });
    setError(null);
    setResult(null);
    onCloseRef.current();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;
    setError(null);
    setSubmitting(true);

    try {
      const res  = await fetch("/api/v1/testers/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, projectId: project.id, consent }),
      });
      const data = await res.json();

      if (!res.ok || !data.token) {
        setError(data.error ?? "error al procesar la solicitud");
      } else {
        setResult(data as TokenResult);
        setStep("token");
      }
    } catch {
      setError("error de conexión — intenta de nuevo");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200]"
            aria-hidden="true"
          />

          <motion.div
            key="modal"
            ref={trapRef}
            role="dialog" aria-modal="true"
            aria-label={`obtener binario seguro: ${project.name}`}
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201]
                       w-full max-w-md bg-zinc-950 border border-slate-800"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-800/60">
              <div>
                <span className="font-mono text-[10px] text-[#C97352] uppercase tracking-widest block mb-0.5">
                  // obtener binario seguro
                </span>
                <h3 className="font-mono text-sm text-white lowercase leading-tight">{project.name}</h3>
              </div>
              <button ref={closeRef} onClick={handleClose}
                className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5" aria-label="cerrar">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Checking */}
              {step === "check" && (
                <p className="font-mono text-xs text-slate-500 lowercase animate-pulse">
                  {">"} verificando disponibilidad del binario...
                </p>
              )}

              {/* Unavailable */}
              {step === "unavailable" && (
                <div className="space-y-3">
                  <div className="font-mono text-[11px] text-slate-500 border border-slate-800/50 p-3 bg-black/30 leading-relaxed space-y-1">
                    <p className="text-amber-600/60 uppercase tracking-widest text-[10px]">// estado del binario</p>
                    <p>{">"} el binario de prueba aún no está disponible para este proyecto.</p>
                    <p>{">"} el agente lo compilará en la próxima iteración del sandbox.</p>
                  </div>
                </div>
              )}

              {/* Lead capture form */}
              {step === "form" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="font-mono text-[11px] text-slate-500 border border-slate-800/50 p-3 bg-black/30 leading-relaxed">
                    <span className="text-[#C97352]/60 uppercase tracking-widest text-[10px]">// acceso al entorno cerrado —</span>{" "}
                    registra tu perfil para obtener el token de acceso. el periodo de prueba de{" "}
                    <span className="text-slate-400">30 días</span> comienza en el primer arranque de la app.
                  </div>

                  <Field label="nombre_" required>
                    <input required type="text" autoComplete="off"
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                      placeholder="tu nombre completo"
                      className="w-full bg-black border border-slate-800 px-3 py-2 font-mono text-xs text-white
                                 placeholder-slate-600 focus:outline-none focus:border-[#C97352] transition-colors" />
                  </Field>

                  <Field label="email_" required>
                    <input required type="email" autoComplete="off"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className="w-full bg-black border border-slate-800 px-3 py-2 font-mono text-xs text-white
                                 placeholder-slate-600 focus:outline-none focus:border-[#C97352] transition-colors" />
                  </Field>

                  <Field label="perfil_" required>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ROLES.map((r) => (
                        <label key={r.value}
                          className={`flex items-center gap-2 border px-2.5 py-2 cursor-pointer transition-colors font-mono text-[11px] lowercase
                            ${form.rol === r.value
                              ? "border-[#C97352] text-[#C97352] bg-[#C97352]/5"
                              : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400"}`}>
                          <input type="radio" name="rol" value={r.value} required
                            checked={form.rol === r.value}
                            onChange={() => setForm((f) => ({ ...f, rol: r.value }))}
                            className="sr-only" />
                          <span className={`w-1.5 h-1.5 shrink-0 ${form.rol === r.value ? "bg-[#C97352]" : "bg-slate-800"}`} />
                          {r.label}
                        </label>
                      ))}
                    </div>
                  </Field>

                  {/* Consentimiento de datos + términos beta (riesgo #9) */}
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 w-3 h-3 accent-[#C97352] shrink-0"
                    />
                    <span className="font-mono text-[12px] text-slate-500 leading-relaxed lowercase group-hover:text-slate-500 transition-colors">
                      acepto el{" "}
                      <a href="/legal/privacidad" target="_blank" className="text-[#C97352] underline underline-offset-2">
                        aviso de privacidad
                      </a>{" "}
                      y los{" "}
                      <a href="/legal/terminos" target="_blank" className="text-[#C97352] underline underline-offset-2">
                        términos del programa beta
                      </a>
                      , incluido instalar software experimental bajo mi propio riesgo.
                    </span>
                  </label>

                  {error && <p className="font-mono text-xs text-red-400 lowercase">✗ {error}</p>}

                  <button type="submit" disabled={submitting || !form.rol || !consent}
                    className="w-full bg-[#C97352] text-black font-mono text-[11px] uppercase tracking-widest py-2.5
                               hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? "> generando token de acceso..." : "obtener token de acceso"}
                  </button>
                </form>
              )}

              {/* Token result */}
              {step === "token" && result && (
                <div className="space-y-4">
                  {result.isExistingToken && (
                    <div className="font-mono text-[11px] text-amber-600/70 border border-amber-900/30 p-3 leading-relaxed">
                      {">"} ya tienes un token activo para este proyecto.
                    </div>
                  )}

                  <div className="space-y-0 border border-slate-800/50">
                    <TokenRow label="estado"    value={result.status === "pending" ? "pendiente (activa al primer arranque)" : result.status} />
                    <TokenRow label="token"     value={`${result.token.slice(0, 8)}...${result.token.slice(-4)}`} mono />
                    <TokenRow label="vigencia"  value={`${result.lifetimeDays} días desde primer arranque`} />
                    <TokenRow label="enlace válido por" value="24 horas" highlight />
                  </div>

                  {/* Deep link */}
                  <div className="font-mono text-[11px] text-slate-500 border border-slate-800/50 p-3 bg-black/30 space-y-1 leading-relaxed">
                    <p className="text-[#C97352]/60 uppercase tracking-widest text-[10px]">// guarda este enlace</p>
                    <p className="text-slate-500 break-all select-all">
                      {typeof window !== "undefined" ? window.location.origin : ""}/activate/{result.token}
                    </p>
                    <p className="text-slate-500 mt-1">
                      úsalo para verificar el estado de tu token en cualquier momento.
                    </p>
                  </div>

                  {!result.downloadExpired ? (
                    <a href={result.downloadUrl} download
                      className="flex items-center justify-center gap-2 w-full bg-emerald-950 border border-emerald-800
                                 text-emerald-400 font-mono text-[11px] uppercase tracking-widest py-3
                                 hover:bg-emerald-900 transition-colors">
                      ↓ descargar binario — enlace válido 24h
                    </a>
                  ) : (
                    <div className="font-mono text-[11px] text-slate-500 border border-slate-800/50 p-3 leading-relaxed">
                      {">"} el enlace de descarga expiró. tu token sigue vigente — contacta a rzstudio para un nuevo enlace.
                    </div>
                  )}

                  <p className="font-mono text-[11px] text-slate-500 lowercase leading-relaxed text-center">
                    recibirás seguimiento del agente simbiosis en 48h.
                    reporta bugs directamente desde la app.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[11px] text-slate-500 uppercase tracking-wider block">
        {label}{required && <span className="text-[#C97352] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TokenRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-800/50 px-3 py-2 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500 shrink-0">{label}</span>
      <span className={`font-mono text-[12px] lowercase text-right ${highlight ? "text-amber-400" : "text-slate-300"} ${mono ? "tracking-wider" : ""}`}>
        {value}
      </span>
    </div>
  );
}
