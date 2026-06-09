// HMAC-SHA256 session tokens using Web Crypto (works in both Node.js and Edge runtimes)

const COOKIE_NAME = "rz_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function toBase64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromBase64url(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = toBase64url(new TextEncoder().encode(JSON.stringify({ ts: Date.now() })));
  const key = await importKey(secret);
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64url(sigBuf)}`;
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  try {
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64url(payload!)));
    if (!decoded.ts || Date.now() - decoded.ts > SESSION_TTL_MS) return false;
    const key = await importKey(secret);
    return crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64url(sig!),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
