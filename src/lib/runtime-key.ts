// Almacén de la API key de Anthropic conectada desde el panel admin.
// Persiste SIEMPRE en Firestore (independiente de RZ_STORAGE) para sobrevivir
// reinicios y redeploys de Cloud Run. El driver local (json) es efímero y no
// puede ser la fuente de verdad de una credencial de producción.
//
// Orden de resolución: cache en memoria → Firestore → variable de entorno.

import { fire } from "./db";

const CACHE_KEY = "__rz_anthropic_key__";
const COL       = "config";
const DOC       = "anthropic";

function cache(): { key?: string; loaded?: boolean } {
  const g = global as Record<string, unknown>;
  if (!g[CACHE_KEY]) g[CACHE_KEY] = {};
  return g[CACHE_KEY] as { key?: string; loaded?: boolean };
}

/** Lee la key activa: memoria → Firestore → env var. Cachea lo que encuentre. */
export async function getActiveKey(): Promise<string | undefined> {
  const c = cache();
  if (c.key) return c.key;

  if (!c.loaded) {
    c.loaded = true;
    try {
      const snap = await fire().collection(COL).doc(DOC).get();
      if (snap.exists && snap.data()?.key) {
        c.key = snap.data()!.key as string;
        return c.key;
      }
    } catch {
      // Firestore no disponible (sin roles/datastore.user) — caemos a env var
    }
  }

  return process.env.ANTHROPIC_API_KEY;
}

/** Persiste la key en Firestore + cache. Sobrevive reinicios de Cloud Run. */
export async function setActiveKey(key: string): Promise<void> {
  cache().key = key;
  cache().loaded = true;
  try {
    await fire().collection(COL).doc(DOC).set({ key, updatedAt: new Date().toISOString() });
  } catch (e) {
    // Sin Firestore la key vive solo en memoria hasta el próximo restart
    console.warn("[runtime-key] Firestore no disponible — key solo en RAM:", (e as Error).message);
  }
}

export function maskKey(key: string): string {
  if (key.length < 12) return "sk-ant-***";
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}
