// Rate limiter en memoria (ventana deslizante simple).
// Suficiente con Cloud Run a max-instances=1; al migrar a multi-instancia
// debe sustituirse por un contador compartido (Firestore/Redis) — ver RIESGOS_PENDIENTES.md

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Limpieza perezosa para que el Map no crezca sin límite
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export interface RateResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/** key: identificador (ej. "chat:1.2.3.4") — max peticiones por ventana. */
export function checkRateLimit(key: string, max: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
