import type { Metadata } from "next";
import Link from "next/link";
import { ContactChannel, LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { legalConfig } from "@/lib/legal/config";

export const metadata: Metadata = {
  title: "Términos y condiciones | Manish 3D",
  description:
    "Condiciones de compra de Manish 3D: precios, plazos de producción, envíos, pagos, garantía y derecho de arrepentimiento.",
};

export default function TerminosPage() {
  const identidad = [legalConfig.legalName, legalConfig.taxId ? `CUIT ${legalConfig.taxId}` : "", legalConfig.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <LegalPage
      eyebrow="Legales"
      title="Términos y condiciones"
      intro="Las reglas de la compra: qué comprás, cuándo llega, cómo se paga y qué pasa si algo sale mal."
    >
      <LegalSection title="Quién vende">
        <p>
          Los productos de este sitio los vende {legalConfig.brandName}
          {identidad ? `, ${identidad}` : null}. Al comprar aceptás estas condiciones, que conviven con la{" "}
          <Link href="/privacidad" className="font-bold text-white underline-offset-4 hover:underline">
            política de protección de datos
          </Link>{" "}
          y la{" "}
          <Link href="/devoluciones" className="font-bold text-white underline-offset-4 hover:underline">
            política de devoluciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Productos hechos por encargo">
        <p>
          Cada pieza se imprime en 3D, en muchos casos <strong className="text-white">después</strong> de que hacés el
          pedido. Eso tiene dos consecuencias que preferimos decir de entrada:
        </p>
        <LegalList
          items={[
            "Puede haber diferencias mínimas de color, terminación o capas entre una pieza y otra, o respecto de las fotos. Son propias del proceso, no defectos.",
            "Los productos marcados como “a pedido” no tienen stock inmediato: se producen cuando los comprás.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Precios y pagos">
        <LegalList
          items={[
            "Los precios están en pesos argentinos e incluyen impuestos, salvo que se aclare lo contrario.",
            "El precio que vale es el que ves al momento de confirmar la compra. Si un producto quedara publicado con un precio equivocado por un error evidente, te lo avisamos y podés cancelar sin costo.",
            "Los pagos se procesan en Mercado Pago. No guardamos los datos de tu tarjeta.",
            "El pedido se confirma cuando el pago queda acreditado. Hasta ese momento, el stock puede agotarse.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Plazos y envíos">
        <p>
          El plazo de producción depende de la pieza y te lo informamos al comprar o por los canales de contacto. Al
          plazo de producción se le suma el de la entrega.
        </p>
        <p>
          Hacemos entregas en zona (Malvinas Argentinas, San Miguel y José C. Paz) y envíos al resto del país. El costo
          y la modalidad se muestran antes de confirmar la compra.
        </p>
        <p>
          Los plazos son estimados y de buena fe: pueden correrse por demoras del correo, feriados o problemas de
          producción. Si eso pasa, te avisamos.
        </p>
      </LegalSection>

      <LegalSection title="Si el producto llega con problemas">
        <p>
          Si la pieza llega dañada, fallada o no es la que pediste, escribinos <ContactChannel /> dentro de las 48 horas
          de recibirla, con fotos. La reponemos o te devolvemos el dinero, sin vueltas. El detalle está en la{" "}
          <Link href="/devoluciones" className="font-bold text-white underline-offset-4 hover:underline">
            política de devoluciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Derecho de arrepentimiento">
        <p>
          Si comprás a distancia, tenés <strong className="text-white">10 días corridos</strong> desde que recibís el
          producto para arrepentirte y devolverlo, sin tener que dar explicaciones y sin costo de devolución, según el
          artículo 34 de la Ley 24.240.
        </p>
        <p>
          Podés ejercerlo desde el{" "}
          <Link href="/arrepentimiento" className="font-bold text-[#a772ca] underline-offset-4 hover:underline">
            botón de arrepentimiento
          </Link>
          . Este derecho no aplica a los productos hechos según tus especificaciones o claramente personalizados, que
          por su naturaleza no podemos revender.
        </p>
      </LegalSection>

      <LegalSection title="Propiedad intelectual">
        <p>
          Los diseños propios, las fotos y los textos de este sitio son de {legalConfig.brandName}. Si nos encargás una
          pieza a partir de un archivo o una referencia tuya, sos responsable de tener los derechos para reproducirla:
          no imprimimos piezas que infrinjan derechos de terceros.
        </p>
      </LegalSection>

      <LegalSection title="Tu cuenta">
        <p>
          Sos responsable de la contraseña de tu cuenta y de lo que se haga con ella. Si detectás un acceso que no
          reconocés, avisanos. Podemos suspender cuentas que se usen para fraude o para dañar el servicio.
        </p>
      </LegalSection>

      <LegalSection title="Cambios y ley aplicable">
        <p>
          Podemos actualizar estas condiciones; la versión vigente es siempre la publicada acá, con su fecha. Los
          cambios no afectan a las compras ya hechas.
        </p>
        <p>
          Se aplican las leyes de la República Argentina, en especial la Ley 24.240 de Defensa del Consumidor. Ante un
          conflicto podés acudir al{" "}
          <a
            href="https://www.argentina.gob.ar/servicio/iniciar-un-reclamo-ante-defensa-de-las-y-los-consumidores"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-white underline-offset-4 hover:underline"
          >
            servicio de Defensa del Consumidor
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
