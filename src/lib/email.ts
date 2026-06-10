// Servicio de correo vía Resend (REST puro, sin SDK).
// Se activa configurando RESEND_API_KEY y EMAIL_FROM en el entorno.
// Estilo: texto plano brutalista (doc §8.2).

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!emailConfigured()) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to:   [to],
      subject,
      text,
    }),
  });

  return res.ok;
}

function baseUrl(): string {
  return (process.env.RZ_BASE_URL ?? "https://rzstudio.dev").trim().replace(/[,\/\s]+$/, "");
}

// ─── Plantillas (texto plano, diseño brutalista) ─────────────────────────────

export async function sendWarningEmail(to: string, projectName: string, daysLeft: number, token: string) {
  return sendEmail(
    to,
    `[rzstudio] tu entorno de pruebas expira en ${daysLeft} días`,
    `> AVISO DE EXPIRACIÓN
> ====================

tu acceso beta a "${projectName}" expira en ${daysLeft} días.

estado de tu token:
${baseUrl()}/activate/${token}

si necesitas más tiempo, responde este correo solicitando renovación.

-- rzstudio // laboratorio simbiosis`,
  );
}

export async function sendFollowupEmail(to: string, projectName: string, token: string) {
  return sendEmail(
    to,
    `[rzstudio] ¿sobrevivió el código?`,
    `> SEGUIMIENTO 48H
> ===============

hace dos días activaste "${projectName}" en tu dispositivo.

¿sobrevivió el código? entra aquí y cuéntale al agente simbiosis qué falló:
${baseUrl()}/simbiosis?view=simbiosis

tu token sigue activo: ${baseUrl()}/activate/${token}

cada bug que reportes alimenta la próxima iteración del binario.

-- rzstudio // laboratorio simbiosis`,
  );
}

export async function sendExpiredEmail(to: string, projectName: string) {
  return sendEmail(
    to,
    `[rzstudio] periodo de prueba finalizado — ${projectName}`,
    `> ENTORNO BLOQUEADO
> =================

tu periodo de prueba de "${projectName}" terminó y la app quedó bloqueada.

¿quieres seguir probando? responde este correo solicitando renovación
y el administrador extenderá tu acceso.

gracias por estresar nuestro código.

-- rzstudio // laboratorio simbiosis`,
  );
}
