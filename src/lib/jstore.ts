// Capa base de almacenamiento JSON en disco.
// En Cloud Run, monta un bucket GCS como volumen y apunta RZ_DATA_DIR / RZ_APK_DIR
// a ese punto de montaje para que los datos sobrevivan deploys y reinicios:
//   gcloud run services update SERVICIO \
//     --add-volume name=rzdata,type=cloud-storage,bucket=TU_BUCKET \
//     --add-volume-mount volume=rzdata,mount-path=/mnt/rzdata \
//     --set-env-vars RZ_DATA_DIR=/mnt/rzdata/data,RZ_APK_DIR=/mnt/rzdata/apks

import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = process.env.RZ_DATA_DIR ?? path.join(process.cwd(), "data");
export const APK_DIR  = process.env.RZ_APK_DIR  ?? path.join(process.cwd(), "public", "apks");

export function isPersistentStorage(): boolean {
  return !!process.env.RZ_DATA_DIR;
}

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function dataFile(name: string): string {
  return path.join(DATA_DIR, name);
}

export function readJson<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")) as T; }
  catch { return fallback; }
}

export function writeJson(file: string, data: unknown) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file); // escritura atómica — evita JSON corrupto si el proceso muere
}

/** Append a un log JSONL (una línea JSON por evento). */
export function appendLog(file: string, entry: unknown) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, JSON.stringify(entry) + "\n");
}

export function readLog<T>(file: string, limit = 200): T[] {
  try {
    const lines = fs.readFileSync(file, "utf-8").trim().split("\n").filter(Boolean);
    return lines.slice(-limit).map((l) => JSON.parse(l) as T);
  } catch {
    return [];
  }
}
