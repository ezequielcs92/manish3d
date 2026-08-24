import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { legalConfig } from "@/lib/legal/config";

export const metadata: Metadata = {
  title: "Política de protección de datos | Manish 3D",
  description:
    "Qué datos personales recolecta Manish 3D, para qué los usa, con quién los comparte y cómo ejercer tus derechos según la Ley 25.326.",
};

export default function PrivacidadPage() {
  const responsable = [legalConfig.legalName, legalConfig.taxId ? `CUIT ${legalConfig.taxId}` : "", legalConfig.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <LegalPage
      eyebrow="Legales"
      title="Protección de datos personales"
      intro="Qué información tuya guardamos, para qué la usamos y cómo pedirnos que la corrijamos o la borremos."
    >
      <LegalSection title="Quién es responsable de tus datos">
        <p>
          {legalConfig.brandName} es responsable de la base de datos donde se guarda la información de clientes y
          pedidos de este sitio.
          {responsable ? ` ${responsable}.` : null}
        </p>
        <p>
          Para cualquier consulta sobre el tratamiento de tus datos, escribinos a{" "}
          <a href={`mailto:${legalConfig.contactEmail}`} className="font-bold text-[#a772ca] underline-offset-4 hover:underline">
            {legalConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Qué datos recolectamos">
        <p>Solo los que necesitamos para vender y entregar. En concreto:</p>
        <LegalList
          items={[
            <>
              <strong className="text-white">Si creás una cuenta:</strong> tu email, tu nombre y la contraseña (que
              guardamos cifrada, nunca en texto plano). Después, si los cargás, tu teléfono y tu dirección de entrega.
            </>,
            <>
              <strong className="text-white">Si hacés un pedido:</strong> nombre, teléfono, email, dirección de envío,
              referencias de entrega y el detalle de lo que compraste.
            </>,
            <>
              <strong className="text-white">Datos técnicos mínimos:</strong> la cookie que mantiene tu sesión abierta.
              Está detallada en la{" "}
              <Link href="/cookies" className="font-bold text-white underline-offset-4 hover:underline">
                política de cookies
              </Link>
              .
            </>,
          ]}
        />
        <p>
          <strong className="text-white">No guardamos los datos de tu tarjeta.</strong> El pago se procesa
          íntegramente en Mercado Pago: nosotros recibimos únicamente el resultado de la operación y un identificador
          para vincularlo con tu pedido.
        </p>
        <p>
          Este sitio no tiene cookies de analítica, de publicidad ni de terceros que te sigan entre sitios. No armamos
          perfiles ni vendemos datos a nadie.
        </p>
      </LegalSection>

      <LegalSection title="Para qué los usamos">
        <LegalList
          items={[
            "Producir, preparar y enviar tu pedido.",
            "Contactarte por WhatsApp o email si hay algo que resolver sobre una compra.",
            "Que puedas ver el estado y el historial de tus pedidos desde tu cuenta.",
            "Cumplir con las obligaciones fiscales y contables de la actividad.",
          ]}
        />
        <p>
          No usamos tus datos para publicidad ni te mandamos comunicaciones comerciales si no las pediste.
        </p>
      </LegalSection>

      <LegalSection title="Con quién los compartimos">
        <p>Solo con los proveedores que hacen funcionar la tienda, y únicamente con los datos que cada uno necesita:</p>
        <LegalList
          items={[
            <>
              <strong className="text-white">Supabase</strong> — base de datos y cuentas de usuario.
            </>,
            <>
              <strong className="text-white">Vercel</strong> — hosting del sitio.
            </>,
            <>
              <strong className="text-white">Mercado Pago</strong> — procesamiento de los pagos, bajo su propia política
              de privacidad.
            </>,
            <>
              <strong className="text-white">Servicios de envío</strong> — solo los datos necesarios para entregarte el
              pedido.
            </>,
          ]}
        />
        <p>
          Algunos de estos proveedores alojan información fuera de la Argentina. No cedemos tus datos a terceros con
          fines comerciales ni publicitarios.
        </p>
      </LegalSection>

      <LegalSection title="Cuánto tiempo los guardamos">
        <p>
          Los datos de tu cuenta se conservan mientras la cuenta exista. Los de tus pedidos se conservan por el plazo
          que exige la normativa fiscal y contable, aun si cerrás la cuenta, porque respaldan operaciones ya hechas.
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          Podés pedirnos, en cualquier momento y sin costo, acceder a tus datos, corregirlos, actualizarlos o
          eliminarlos. Escribinos a{" "}
          <a href={`mailto:${legalConfig.contactEmail}`} className="font-bold text-[#a772ca] underline-offset-4 hover:underline">
            {legalConfig.contactEmail}
          </a>{" "}
          desde el email de tu cuenta y lo resolvemos. Los datos de nombre, teléfono y dirección también los podés
          editar vos mismo desde{" "}
          <Link href="/cuenta" className="font-bold text-white underline-offset-4 hover:underline">
            tu cuenta
          </Link>
          .
        </p>
        <p className="rounded-2xl border border-white/10 bg-[#151317] p-5 text-sm italic leading-7 text-[#8f8b94]">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.
        </p>
        <p>
          La Agencia de Acceso a la Información Pública, órgano de control de la Ley Nº 25.326, tiene la atribución de
          atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento
          de las normas vigentes en materia de protección de datos personales.
        </p>
      </LegalSection>

      <LegalSection title="Seguridad">
        <p>
          Las contraseñas se almacenan cifradas y el acceso a la base está restringido por permisos: cada persona solo
          puede leer y modificar sus propios datos, y los perfiles del equipo tienen accesos diferenciados según su rol.
          El sitio se sirve íntegramente por HTTPS.
        </p>
        <p>
          Ningún sistema es infalible: si detectáramos un incidente que afecte tus datos, te lo comunicaríamos y
          daríamos aviso a la autoridad correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="Menores de edad">
        <p>
          La tienda está pensada para mayores de 18 años. Si sos menor, necesitás que una persona adulta responsable
          haga la compra y preste el consentimiento por vos.
        </p>
      </LegalSection>

      <LegalSection title="Cambios en esta política">
        <p>
          Si cambiamos algo relevante, actualizamos la fecha del encabezado y publicamos la nueva versión en esta misma
          página. Te recomendamos revisarla cada tanto.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
