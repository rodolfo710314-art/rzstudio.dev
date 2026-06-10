import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "rzstudio // términos del programa beta",
  description: "Términos y condiciones del laboratorio de pruebas beta Simbiosis",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-mono text-sm text-copper lowercase mt-10 mb-3">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-sm text-slate-300 font-light leading-relaxed mb-3">{children}</p>;
}

export default function TerminosPage() {
  return (
    <article>
      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block mb-2">
        // legal
      </span>
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white font-sans">
        términos del programa beta
      </h1>
      <p className="font-mono text-[11px] text-slate-600 mt-3 lowercase">
        laboratorio simbiosis · versión base — en revisión por asesoría legal. última actualización: 11 de junio de 2026.
      </p>

      <P>
        Al registrarte como tester y descargar un binario del laboratorio Simbiosis de
        rzstudio.dev, aceptas estos términos.
      </P>

      <H2>1. naturaleza del programa</H2>
      <P>
        El laboratorio distribuye <strong className="text-white">software experimental en fase de pruebas (beta)</strong>.
        Los binarios pueden contener errores, comportarse de forma inesperada, consumir recursos
        del dispositivo o dejar de funcionar sin previo aviso.
      </P>

      <H2>2. licencia de uso</H2>
      <P>
        Te otorgamos una licencia personal, intransferible, revocable y temporal para instalar
        y usar el binario exclusivamente con fines de evaluación durante el periodo de prueba
        (30 días desde el primer arranque, con un máximo de 2 renovaciones a criterio de RZStudio).
      </P>
      <P>
        No está permitido: redistribuir el binario, descompilarlo o aplicarle ingeniería inversa,
        usarlo con fines comerciales, ni transferir tu token de acceso a terceros.
      </P>

      <H2>3. control de acceso</H2>
      <P>
        Tu acceso se gestiona mediante un token digital personal que la aplicación verifica en
        cada arranque. RZStudio puede revocar el acceso en cualquier momento. Al expirar o
        revocarse el token, la aplicación se bloquea.
      </P>

      <H2>4. tus obligaciones</H2>
      <P>
        Proporcionar datos de registro veraces; usar el binario solo en dispositivos de tu
        propiedad o bajo tu control; y no emplear la aplicación para actividades ilícitas.
      </P>

      <H2>5. exclusión de garantías y limitación de responsabilidad</H2>
      <P>
        EL SOFTWARE BETA SE ENTREGA &quot;TAL CUAL&quot;, SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA.
        INSTALAS Y USAS EL BINARIO BAJO TU PROPIO RIESGO. EN LA MÁXIMA MEDIDA PERMITIDA POR LA
        LEY, RZSTUDIO NO SERÁ RESPONSABLE POR DAÑOS DIRECTOS O INDIRECTOS, PÉRDIDA DE DATOS,
        DAÑOS AL DISPOSITIVO, LUCRO CESANTE NI CUALQUIER OTRO PERJUICIO DERIVADO DEL USO O LA
        IMPOSIBILIDAD DE USO DEL SOFTWARE BETA.
      </P>

      <H2>6. retroalimentación</H2>
      <P>
        Cualquier comentario, reporte de error o sugerencia que envíes puede ser usado por
        RZStudio para mejorar sus productos, sin obligación de compensación ni atribución.
      </P>

      <H2>7. propiedad intelectual</H2>
      <P>
        El binario, su código, marcas y materiales asociados son propiedad de RZStudio. Este
        programa no te transfiere ningún derecho de propiedad intelectual.
      </P>

      <H2>8. datos personales</H2>
      <P>
        El tratamiento de tus datos se rige por nuestro{" "}
        <Link href="/legal/privacidad" className="text-copper">aviso de privacidad</Link>. Al
        registrarte consientes el tratamiento ahí descrito, incluidas las comunicaciones
        operativas del programa.
      </P>

      <H2>9. vigencia</H2>
      <P>
        RZStudio puede modificar estos términos o terminar el programa beta en cualquier momento.
      </P>
    </article>
  );
}
