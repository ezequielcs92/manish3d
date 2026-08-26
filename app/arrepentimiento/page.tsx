import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { RetractionForm } from "@/components/legal/retraction-form";

export const metadata: Metadata = {
  title: "Botón de arrepentimiento | Manish 3D",
  description:
    "Arrepentite de tu compra dentro de los 10 días y pedí la devolución sin costo, como establece la Ley 24.240.",
};

export default function ArrepentimientoPage() {
  return (
    <LegalPage
      eyebrow="Legales"
      title="Botón de arrepentimiento"
      intro="Si te arrepentiste de una compra, completá este formulario. No hace falta que expliques por qué."
    >
      <LegalSection title="Tu derecho">
        <p>
          Cuando comprás a distancia tenés <strong className="text-white">10 días corridos</strong> desde que recibís el
          producto —o desde que cerrás la compra, si eso pasó después— para arrepentirte y devolverlo. Es el artículo 34
          de la Ley 24.240 de Defensa del Consumidor, y ejercerlo{" "}
          <strong className="text-white">no tiene costo para vos</strong>: la devolución la pagamos nosotros.
        </p>
        <LegalList
          items={[
            "No tenés que justificar la decisión.",
            "La pieza tiene que estar sin uso y en las mismas condiciones en que llegó.",
            "El reintegro se hace por el mismo medio de pago que usaste.",
          ]}
        />
        <p>
          La única excepción son las piezas hechas a tu medida o personalizadas, que la propia ley deja fuera porque no
          se pueden revender. El detalle está en{" "}
          <Link href="/devoluciones" className="font-bold text-white underline-offset-4 hover:underline">
            cambios y devoluciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Pedí la cancelación">
        <p className="!mb-6">
          Con tu nombre y tu email alcanza. Si tenés a mano el número de pedido, lo encontramos más rápido.
        </p>
        <RetractionForm />
      </LegalSection>

      <LegalSection title="Qué pasa después">
        <p>
          Registramos tu solicitud y te contactamos dentro de las <strong className="text-white">48 horas hábiles</strong>{" "}
          para coordinar el retiro de la pieza y el reintegro. Si ya te habíamos enviado el pedido, te indicamos cómo
          devolverlo sin que tengas que pagar el envío.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
