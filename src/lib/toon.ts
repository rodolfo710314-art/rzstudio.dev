// Protocolo TOON (Token-Oriented Object Notation) — serialización compacta
// para inyectar datos estructurados a los LLMs (ADR 11/06/2026).
//
// Regla del proyecto: el formato lo decide el CONSUMIDOR del mensaje.
//   código  → JSON (estructura exacta)
//   modelo  → TOON (significado denso, ~40-60% menos tokens en datos tabulares)
//
// Formato:
//   clave: valor                      ← escalares
//   lista[3]: a,b,c                   ← array de primitivos
//   tabla[2]{col1,col2}:              ← array de objetos uniformes
//     v1,v2
//     v3,v4

type Primitive = string | number | boolean | null;

function scalar(v: Primitive): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Comillas solo si el valor contiene separadores que romperían la fila
  return /[,\n]/.test(s) ? JSON.stringify(s) : s;
}

function isPrimitive(v: unknown): v is Primitive {
  return v === null || ["string", "number", "boolean"].includes(typeof v);
}

/** Codifica un valor a TOON. Profundidad pensada para contexto de prompts, no para persistencia. */
export function toToon(value: unknown, indent = ""): string {
  if (isPrimitive(value)) return scalar(value);

  // Array de primitivos → lista en una línea
  if (Array.isArray(value)) {
    if (value.length === 0) return "[0]:";
    if (value.every(isPrimitive)) {
      return `[${value.length}]: ${value.map((v) => scalar(v as Primitive)).join(",")}`;
    }
    // Array de objetos uniformes → tabla
    if (value.every((v) => typeof v === "object" && v !== null && !Array.isArray(v))) {
      const rows = value as Record<string, unknown>[];
      const cols = Object.keys(rows[0]).filter((k) => rows.every((r) => isPrimitive(r[k])));
      const header = `[${rows.length}]{${cols.join(",")}}:`;
      const body = rows
        .map((r) => indent + "  " + cols.map((c) => scalar(r[c] as Primitive)).join(","))
        .join("\n");
      return `${header}\n${body}`;
    }
    // Mixto: una entrada por línea
    return `[${value.length}]:\n` + value
      .map((v) => `${indent}  - ${toToon(v, indent + "  ")}`)
      .join("\n");
  }

  // Objeto → clave: valor por línea
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const encoded = toToon(v, indent);
        const sep = isPrimitive(v) ? ": " : "";
        return `${indent}${k}${sep}${encoded}`;
      })
      .join("\n");
  }

  return scalar(String(value));
}

/** Bloque TOON con etiqueta — listo para pegar en un system prompt. */
export function toonBlock(label: string, value: unknown): string {
  return `${label}:\n${toToon(value, "  ")}`;
}
