// Almacén de la API key de Anthropic conectada desde el panel admin.
// Fase B-bis: persiste en Firestore (colección `config`, doc `anthropic`) para
// sobrevivir reinicios/redeploys/nuevas instancias de Cloud Run.
//
// Orden de resolución: cache en memoria → Firestore → variable de entorno.
// El cache evita pegarle a Firestore en cada request; Firestore es la fuente
// de verdad de lo conectado desde el panel; la env var es el respaldo inicial.

import { docGet, docSet } from "./db";

const CACHE_KEY = "__rz_anthropic_key__";
const COL = "config";
const DOC = "anthropic";

interface KeyDoc { id: string; key: string; updatedAt: string }

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
    try {
      const doc = await docGet<KeyDoc>(COL, DOC);
      c.loaded = true;
      if (doc?.key) {
        c.key = doc.key;
        return doc.key;
      }
    } catch {
      // Firestore no disponible — caemos a la env var
    }
  }

  return process.env.ANTHROPIC_API_KEY;
}

/** Persiste la key en Firestore + cache. Sobrevive reinicios de Cloud Run. */
export async function setActiveKey(key: string): Promise<void> {
  cache().key = key;
  cache().loaded = true;
  await docSet<KeyDoc>(COL, { id: DOC, key, updatedAt: new Date().toISOString() });
}

export function maskKey(key: string): string {
  if (key.length < 12) return "sk-ant-***";
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}
