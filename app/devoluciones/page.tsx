import type { Metadata } from "next";
import Link from "next/link";
import { ContactChannel, LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Cambios y devoluciones | Manish 3D",
  description:
    "Cómo cambiar o devolver una compra en Manish 3D: plazos, condiciones, productos personalizados y cómo se hace el reintegro.",
};

export default function DevolucionesPage() {
  return (
    <LegalPage
      eyebrow="Legales"
      title="Cambios y devoluciones"
      intro="Qué hacer si la pieza llegó mal, si no era lo que esperabas, o si simplemente te arrepentiste."
    >
      <LegalSection title="Si llegó fallada, dañada o equivocada">
        <p>
          Escribinos <ContactChannel /> dentro de las <strong className="text-white">48 horas</strong> de recibir el
          pedido, con fotos de la pieza y del embalaje. Nos hacemos cargo: la reimprimimos y te la enviamos sin costo, o
          te devolvemos el dinero, lo que prefieras.
        </p>
        <p>El costo del envío de vuelta, si hace falta, corre por nuestra cuenta.</p>
      </LegalSection>

      <LegalSection title="Si te arrepentiste">
        <p>
          Tenés <strong className="text-white">10 días corridos</strong> desde que recibís el producto para devolverlo
          sin dar explicaciones, como establece el artículo 34 de la Ley 24.240. Iniciá el trámite desde el{" "}
          <Link href="/arrepentimiento" className="font-bold text-[#a772ca] underline-offset-4 hover:underline">
            botón de arrepentimiento
          </Link>
          .
        </p>
        <p>
          La pieza tiene que volver sin uso y en las mismas condiciones en que llegó. El costo de la devolución lo
          asumimos nosotros.
        </p>
      </LegalSection>

      <LegalSection title="Qué no se puede devolver">
        <LegalList
          items={[
            "Piezas hechas a tu medida: encargos a partir de tu archivo, tu referencia o con personalización (nombres, fechas, colores elegidos por vos). Por su naturaleza no podemos revenderlas, y la propia ley excluye estos casos del arrepentimiento.",
            "Piezas con desgaste, roturas o modificaciones posteriores a la entrega.",
          ]}
        />
        <p>
          Que un producto sea personalizado no te quita el derecho al reclamo si llegó fallado: eso entra en el punto de
          arriba y lo cubrimos igual.
        </p>
      </LegalSection>

      <LegalSection title="Diferencias propias de la impresión 3D">
        <p>
          Las piezas se imprimen capa por capa. Pequeñas variaciones de tono entre lotes, líneas de capa visibles o
          diferencias mínimas respecto de las fotos son características del proceso, no defectos, y no habilitan por sí
          solas un cambio por falla. Si algo no te cierra, escribinos igual y lo miramos juntos.
        </p>
      </LegalSection>

      <LegalSection title="Cómo se devuelve la plata">
        <p>
          El reintegro se hace por el mismo medio con el que pagaste, a través de Mercado Pago. El plazo de acreditación
          depende de tu banco o billetera; desde nuestro lado lo procesamos apenas recibimos la pieza de vuelta o
          confirmamos la falla.
        </p>
        <p>Cuando el reembolso se procesa, el pedido queda marcado como reembolsado y podés verlo en tu cuenta.</p>
      </LegalSection>

      <LegalSection title="Cambios por otro producto">
        <p>
          Si querés cambiar por otra pieza, escribinos <ContactChannel />. Si hay diferencia de precio, se ajusta:
          pagás la diferencia o te la reintegramos.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
