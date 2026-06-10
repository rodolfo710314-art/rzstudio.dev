import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "rzstudio // aviso de privacidad",
  description: "Cómo recolectamos, usamos y protegemos tus datos personales en rzstudio.dev",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-mono text-sm text-copper lowercase mt-10 mb-3">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-sm text-slate-300 font-light leading-relaxed mb-3">{children}</p>;
}

export default function PrivacidadPage() {
  return (
    <article>
      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block mb-2">
        // legal
      </span>
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white font-sans">
        aviso de privacidad
      </h1>
      <p className="font-mono text-[11px] text-slate-600 mt-3 lowercase">
        versión base — en revisión por asesoría legal. última actualización: 11 de junio de 2026.
      </p>

      <H2>responsable</H2>
      <P>
        RZStudio es responsable del tratamiento de tus datos personales. Contacto para
        cualquier tema de privacidad: <a href="mailto:rodolfog@rzstudio.dev" className="text-copper">rodolfog@rzstudio.dev</a>.
      </P>

      <H2>qué datos recolectamos</H2>
      <P><strong className="text-white">Formulario de contacto:</strong> tu nombre, correo electrónico y el mensaje que nos envíes.</P>
      <P>
        <strong className="text-white">Programa beta (laboratorio Simbiosis):</strong> tu nombre, correo, el perfil que
        selecciones, tu dirección IP y las fechas en que descargas, activas y usas la aplicación de prueba.
      </P>
      <P>
        <strong className="text-white">Chat con IA:</strong> el contenido de tus mensajes se procesa para generarte una
        respuesta; no almacenamos tus conversaciones. Tu IP se usa temporalmente solo para prevenir abuso.
      </P>
      <P>
        <strong className="text-white">No recolectamos:</strong> datos de pago, datos sensibles, ubicación, contactos ni
        archivos de tu dispositivo. No usamos cookies de rastreo publicitario.
      </P>

      <H2>para qué los usamos</H2>
      <P>
        Responder tus solicitudes y darles seguimiento; gestionar tu acceso al programa beta
        (entrega del binario, periodo de prueba, avisos de expiración y solicitudes de
        retroalimentación); mantener la seguridad de la plataforma; y generar métricas internas
        agregadas que no te identifican.
      </P>

      <H2>con quién compartimos datos</H2>
      <P>
        No vendemos tus datos. Usamos proveedores que los procesan por cuenta nuestra:
        Google Cloud (infraestructura y base de datos), Anthropic y Google (procesamiento de los
        mensajes que escribes a la IA) y Resend (correos operativos). Estos proveedores procesan
        datos en Estados Unidos.
      </P>

      <H2>tus derechos</H2>
      <P>
        Puedes solicitar acceso, rectificación, cancelación u oposición (derechos ARCO), así
        como revocar tu consentimiento, escribiendo a{" "}
        <a href="mailto:rodolfog@rzstudio.dev" className="text-copper">rodolfog@rzstudio.dev</a>.
      </P>

      <H2>seguridad</H2>
      <P>
        Protegemos tus datos con cifrado en tránsito (HTTPS), controles de acceso administrativo,
        limitación de intentos de acceso y tokens de un solo uso no adivinables para la
        distribución de binarios beta.
      </P>

      <H2>menores de edad</H2>
      <P>Nuestros servicios, incluido el programa beta, están dirigidos a mayores de 18 años.</P>

      <H2>cambios a este aviso</H2>
      <P>Publicaremos cualquier cambio en esta misma página indicando la fecha de última actualización.</P>
    </article>
  );
}
