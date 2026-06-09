// Runtime Anthropic key store — survives hot-reloads, resets on server restart.
// Falls back to ANTHROPIC_API_KEY env var if no runtime override is set.
// Only usable in Node.js runtime (API routes), not Edge middleware.

import fs from "node:fs";
import path from "node:path";

const STORE_KEY = "__rz_anthropic_key__";

function globalStore(): { key?: string } {
  const g = global as Record<string, unknown>;
  if (!g[STORE_KEY]) g[STORE_KEY] = {};
  return g[STORE_KEY] as { key?: string };
}

export function getActiveKey(): string | undefined {
  return globalStore().key ?? process.env.ANTHROPIC_API_KEY;
}

export function setActiveKey(key: string): void {
  globalStore().key = key;
}

// Persist to .env.local so the key survives server restarts.
// Silently skips if the file is not writable (e.g. read-only production filesystem).
export function persistKeyToEnvFile(key: string): void {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf-8");
    }
    const lines = content.split("\n").filter(Boolean);
    const idx = lines.findIndex((l) => l.startsWith("ANTHROPIC_API_KEY="));
    if (idx >= 0) {
      lines[idx] = `ANTHROPIC_API_KEY=${key}`;
    } else {
      lines.push(`ANTHROPIC_API_KEY=${key}`);
    }
    fs.writeFileSync(envPath, lines.join("\n") + "\n", "utf-8");
  } catch {
    // Read-only filesystem (Vercel, etc.) — key is stored in memory only for this session.
  }
}

export function maskKey(key: string): string {
  if (key.length < 12) return "sk-ant-***";
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}
