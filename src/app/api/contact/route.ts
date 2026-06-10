// Formulario de contacto real (Fase A): guarda el prospecto SIEMPRE y además
// lo reenvía por correo a CONTACT_EMAIL cuando Resend está configurado.
// Así no se pierde ningún lead aunque el email aún no esté activo.

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { dataFile, readJson, writeJson } from "@/lib/jstore";
import { sendEmail, emailConfigured } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const LEADS_FILE    = dataFile("contact-leads.json");
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "rodolfog@rzstudio.dev";

export interface ContactLead {
  id:        string;
  nombre:    string;
  email:     string;
  mensaje:   string;
  consent:   boolean;
  ip?:       string;
  emailed:   boolean;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  // Anti-spam: 3 envíos por minuto por IP
  const ip = clientIp(req);
  const rate = checkRateLimit(`contact:${ip}`, 3, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "demasiados envíos — espera un momento" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const nombre  = (body.nombre  as string | undefined)?.trim() ?? "";
  const email   = (body.email   as string | undefined)?.trim() ?? "";
  const mensaje = (body.mensaje as string | undefined)?.trim() ?? "";
  const consent = body.consent === true;

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: "nombre, email y mensaje son requeridos" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "email inválido" }, { status: 400 });
  }
  if (mensaje.length > 4000) {
    return NextResponse.json({ error: "mensaje demasiado largo" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json(
      { error: "debes aceptar el aviso de privacidad para enviar" },
      { status: 400 },
    );
  }

  // Reenvío por correo (si Resend está activo)
  let emailed = false;
  if (emailConfigured()) {
    emailed = await sendEmail(
      CONTACT_EMAIL,
      `[rzstudio] nuevo contacto: ${nombre}`,
      `> NUEVO PROSPECTO — FORMULARIO DE CONTACTO
> =========================================

nombre:  ${nombre}
email:   ${email}
fecha:   ${new Date().toLocaleString("es-MX")}

mensaje:
${mensaje}

-- rzstudio // contacto web`,
    );
  }

  // El lead se guarda siempre — el correo es un canal, no la fuente de verdad
  const lead: ContactLead = {
    id: randomUUID(),
    nombre,
    email,
    mensaje,
    consent,
    ip,
    emailed,
    createdAt: new Date().toISOString(),
  };
  const all = readJson<ContactLead[]>(LEADS_FILE, []);
  writeJson(LEADS_FILE, [...all, lead]);

  return NextResponse.json({ ok: true });
}
