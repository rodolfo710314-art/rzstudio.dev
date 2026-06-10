// Capa de datos con doble driver (Fase B — resuelve riesgo #2b):
//   RZ_STORAGE=firestore → Google Cloud Firestore (producción; autentica con la
//                          service account de Cloud Run, sin credenciales en código)
//   sin configurar       → archivos JSON locales (desarrollo y tests)
//
// Cloud Run necesita el rol roles/datastore.user en su service account.

import { Firestore } from "@google-cloud/firestore";
import { dataFile, readJson, writeJson, appendLog, readLog } from "./jstore";

export function firestoreEnabled(): boolean {
  return process.env.RZ_STORAGE === "firestore";
}

let _db: Firestore | null = null;

export function fire(): Firestore {
  if (!_db) {
    _db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || undefined, // autodetecta en Cloud Run
      ignoreUndefinedProperties: true,
    });
  }
  return _db;
}

// ─── Helpers genéricos de documento (driver firestore | archivo) ─────────────
// Driver archivo: cada colección es un JSON con un array de documentos con campo `id`.

type Doc = { id: string };

function fileOf(col: string): string {
  return dataFile(`${col}.json`);
}

export async function docGet<T extends Doc>(col: string, id: string): Promise<T | null> {
  if (firestoreEnabled()) {
    const snap = await fire().collection(col).doc(id).get();
    return snap.exists ? ({ id: snap.id, ...snap.data() } as T) : null;
  }
  return readJson<T[]>(fileOf(col), []).find((d) => d.id === id) ?? null;
}

export async function docSet<T extends Doc>(col: string, doc: T): Promise<void> {
  if (firestoreEnabled()) {
    const { id, ...data } = doc;
    await fire().collection(col).doc(id).set(data);
    return;
  }
  const all = readJson<T[]>(fileOf(col), []);
  writeJson(fileOf(col), [...all.filter((d) => d.id !== doc.id), doc]);
}

export async function docDelete(col: string, id: string): Promise<void> {
  if (firestoreEnabled()) {
    await fire().collection(col).doc(id).delete();
    return;
  }
  const all = readJson<Doc[]>(fileOf(col), []);
  writeJson(fileOf(col), all.filter((d) => d.id !== id));
}

export async function colList<T extends Doc>(
  col: string,
  filter?: (d: T) => boolean,
): Promise<T[]> {
  let docs: T[];
  if (firestoreEnabled()) {
    const snap = await fire().collection(col).get();
    docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  } else {
    docs = readJson<T[]>(fileOf(col), []);
  }
  return filter ? docs.filter(filter) : docs;
}

// ─── Logs append-only (usage, juez) ──────────────────────────────────────────
// Firestore: documento por evento con id automático.
// Archivo: JSONL como hasta ahora.

export async function logAppend(col: string, entry: Record<string, unknown>): Promise<void> {
  if (firestoreEnabled()) {
    await fire().collection(col).add(entry);
    return;
  }
  appendLog(dataFile(`${col}.jsonl`), entry);
}

/** Lee eventos con ts >= since (ISO). El filtrado fino se hace en código — volumen bajo. */
export async function logRead<T>(col: string, sinceIso: string, limit = 50_000): Promise<T[]> {
  if (firestoreEnabled()) {
    const snap = await fire()
      .collection(col)
      .where("ts", ">=", sinceIso)
      .orderBy("ts", "asc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as T);
  }
  return readLog<T>(dataFile(`${col}.jsonl`), limit).filter(
    (e) => ((e as Record<string, unknown>).ts as string) >= sinceIso,
  );
}

/** Últimos N eventos del log (para vistas del dashboard). */
export async function logTail<T>(col: string, limit = 50): Promise<T[]> {
  if (firestoreEnabled()) {
    const snap = await fire()
      .collection(col)
      .orderBy("ts", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as T);
  }
  return readLog<T>(dataFile(`${col}.jsonl`), limit).reverse();
}
