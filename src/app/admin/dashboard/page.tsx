import { AnthropicPanel } from "@/components/admin/AnthropicPanel";
import { ApkManager } from "@/components/admin/ApkManager";
import { OpsPanel } from "@/components/admin/OpsPanel";
import { logoutAction } from "../actions";

export default function AdminDashboard() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-[#1D140F] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[#C97352]" />
          <span className="text-[10px] uppercase tracking-widest text-[#C97352] font-mono">
            rzstudio // panel de administración
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-[10px] uppercase tracking-widest font-mono text-slate-400 hover:text-[#C97352] transition-colors"
          >
            cerrar sesión
          </button>
        </form>
      </div>

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        <section>
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              // motor ia
            </span>
            <h2 className="text-sm font-mono text-white mt-1 lowercase">
              conexión con cuenta anthropic
            </h2>
          </div>
          <AnthropicPanel />
        </section>

        <section>
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              // distribución android
            </span>
            <h2 className="text-sm font-mono text-white mt-1 lowercase">
              binarios seguros — laboratorio simbiosis
            </h2>
          </div>
          <ApkManager />
        </section>

        <section>
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              // operaciones
            </span>
            <h2 className="text-sm font-mono text-white mt-1 lowercase">
              integraciones, costos, actas y juez de hierro
            </h2>
          </div>
          <OpsPanel />
        </section>
      </div>
    </div>
  );
}
