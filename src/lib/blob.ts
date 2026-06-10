// Binarios APK con doble driver (Fase B):
//   RZ_GCS_BUCKET=nombre-del-bucket → Google Cloud Storage (producción)
//   sin configurar                  → disco local (public/apks o RZ_APK_DIR)
//
// Cloud Run necesita roles/storage.objectAdmin sobre el bucket.

import { Storage } from "@google-cloud/storage";
import fs from "node:fs";
import path from "node:path";
import { APK_DIR, ensureDir } from "./jstore";

export function gcsEnabled(): boolean {
  return !!process.env.RZ_GCS_BUCKET;
}

let _storage: Storage | null = null;

function bucket() {
  if (!_storage) _storage = new Storage();
  return _storage.bucket(process.env.RZ_GCS_BUCKET as string);
}

function objectName(projectId: string, filename: string): string {
  return `apks/${projectId}/${filename}`;
}

function localPath(projectId: string, filename: string): string {
  return path.join(APK_DIR, projectId, filename);
}

export async function saveApkBlob(projectId: string, filename: string, data: Buffer): Promise<void> {
  if (gcsEnabled()) {
    await bucket().file(objectName(projectId, filename)).save(data, {
      contentType: "application/vnd.android.package-archive",
      resumable: false,
    });
    return;
  }
  const dest = localPath(projectId, filename);
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, data);
}

export async function readApkBlob(projectId: string, filename: string): Promise<Buffer | null> {
  if (gcsEnabled()) {
    try {
      const [data] = await bucket().file(objectName(projectId, filename)).download();
      return data;
    } catch {
      return null;
    }
  }
  const p = localPath(projectId, filename);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

export async function deleteApkBlob(projectId: string, filename: string): Promise<void> {
  if (gcsEnabled()) {
    await bucket().file(objectName(projectId, filename)).delete({ ignoreNotFound: true });
    return;
  }
  const p = localPath(projectId, filename);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
