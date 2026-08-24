import type { Metadata } from "next";
import Link from "next/link";
import { ContactChannel, LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { cookieNames } from "@/lib/legal/config";

export const metadata: Metadata = {
  title: "Política de cookies | Manish 3D",
  description:
    "Qué cookies usa la tienda de Manish 3D, para qué sirven y cómo eliminarlas. Sin cookies de analítica ni de publicidad.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legales"
      title="Política de cookies"
      intro="Qué guardamos en tu navegador, para qué sirve y cómo borrarlo. Spoiler: es poquísimo."
    >
      <LegalSection title="Qué es una cookie">
        <p>
          Una cookie es un archivo chico que un sitio guarda en tu navegador para recordar algo entre una página y la
          siguiente. Algunas son imprescindibles para que el sitio funcione; otras sirven para medir el comportamiento
          de quienes navegan o mostrar publicidad.
        </p>
        <p className="rounded-2xl border border-[#8a62ab]/40 bg-[#6f2fa3]/12 p-5 font-semibold text-white">
          En este sitio solo usamos las imprescindibles. No hay cookies de analítica, de publicidad ni de terceros que
          te sigan por otras páginas.
        </p>
      </LegalSection>

      <LegalSection title="Qué guardamos exactamente">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-[#8f8b94]">
                <th className="py-3 pr-4 font-bold">Nombre</th>
                <th className="py-3 pr-4 font-bold">Tipo</th>
                <th className="py-3 pr-4 font-bold">Para qué</th>
                <th className="py-3 font-bold">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-[#b8b5bd]">
              <tr className="align-top">
                <td className="py-4 pr-4 font-mono text-xs text-[#a772ca]">{cookieNames.session}</td>
                <td className="py-4 pr-4">Cookie necesaria</td>
                <td className="py-4 pr-4">
                  Mantiene tu sesión abierta después de que iniciás sesión. Sin esto tendrías que ingresar la contraseña
                  en cada página.
                </td>
                <td className="py-4">Hasta que cerrás sesión o vence</td>
              </tr>
              <tr className="align-top">
                <td className="py-4 pr-4 font-mono text-xs text-[#a772ca]">{cookieNames.cart}</td>
                <td className="py-4 pr-4">Almacenamiento local</td>
                <td className="py-4 pr-4">
                  Guarda lo que agregaste al carrito para que no se pierda si cerrás la pestaña. No es técnicamente una
                  cookie y nunca viaja a nuestros servidores: vive solo en tu navegador.
                </td>
                <td className="py-4">Hasta que vacías el carrito o el almacenamiento</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Por qué no te pedimos consentimiento">
        <p>
          Las cookies estrictamente necesarias —las que hacen falta para prestar un servicio que vos pediste, como
          mantener tu sesión— no requieren consentimiento previo. Como no usamos ninguna otra, no vas a encontrarte con
          un cartel de cookies acá.
        </p>
        <p>
          Si en algún momento sumamos herramientas de medición o publicidad, vamos a actualizar esta página y a pedirte
          el consentimiento antes de activarlas.
        </p>
      </LegalSection>

      <LegalSection title="Cómo borrarlas o bloquearlas">
        <p>
          Podés eliminarlas cuando quieras desde la configuración de tu navegador, en la sección de privacidad o datos
          de navegación:
        </p>
        <LegalList
          items={[
            "Chrome y Edge: Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.",
            "Firefox: Ajustes → Privacidad y seguridad → Cookies y datos del sitio.",
            "Safari: Preferencias → Privacidad → Gestionar datos de sitios web.",
          ]}
        />
        <p>
          Tené en cuenta que si bloqueás la cookie de sesión no vas a poder mantenerte logueado, y si borrás el
          almacenamiento local se vacía tu carrito. El resto del sitio funciona igual.
        </p>
      </LegalSection>

      <LegalSection title="Cookies de Mercado Pago">
        <p>
          Cuando pasás a pagar, te llevamos al entorno de Mercado Pago, que tiene sus propias cookies y su propia
          política de privacidad. Ese tramo no lo controlamos nosotros.
        </p>
      </LegalSection>

      <LegalSection title="Relación con tus datos personales">
        <p>
          Qué información tuya guardamos, con quién la compartimos y cómo pedir que la borremos está detallado en la{" "}
          <Link href="/privacidad" className="font-bold text-white underline-offset-4 hover:underline">
            política de protección de datos
          </Link>
          . Ante cualquier duda, escribinos <ContactChannel />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
