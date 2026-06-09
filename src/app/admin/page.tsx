"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import type { LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm border border-[#1D140F]">
        {/* Header */}
        <div className="border-b border-[#1D140F] px-6 py-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#C97352]" />
          <span className="text-[10px] uppercase tracking-widest text-[#C97352] font-mono">
            rzstudio // admin
          </span>
        </div>

        <form action={action} className="p-6 space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="admin-password"
              className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono"
            >
              contraseña de acceso
            </label>
            <input
              id="admin-password"
              name="password"
              type="text"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full bg-[#111111] border border-[#333] px-3 py-2 text-sm font-mono text-white
                         focus:outline-none focus:border-[#C97352] transition-colors placeholder:text-slate-600"
              placeholder="ingresa la contraseña"
            />
            <p className="text-[9px] text-slate-700 font-mono lowercase">
              campo en texto plano para evitar bloqueo de IME en linux
            </p>
          </div>

          {state?.error && (
            <p className="text-xs font-mono text-red-400 lowercase">
              ✗ {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full border border-[#C97352] py-2 text-xs uppercase tracking-widest font-mono text-[#C97352]
                       hover:bg-[#C97352] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "verificando..." : "ingresar"}
          </button>
        </form>

        <div className="border-t border-[#1D140F] px-6 py-3">
          <p className="text-[10px] text-slate-700 font-mono lowercase">
            acceso restringido. solo personal autorizado.
          </p>
        </div>
      </div>
    </div>
  );
}
