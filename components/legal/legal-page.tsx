import Link from "next/link";
import type { ReactNode } from "react";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";
import { legalConfig } from "@/lib/legal/config";

/**
 * Fragmento de frase con el canal de contacto. Se usa como complemento de
 * "Escribinos ___", así que incluye la preposición cuando hay casilla cargada.
 */
export function ContactChannel() {
  if (!legalConfig.contactEmail) {
    return <>por los mismos canales por los que hacés tus compras</>;
  }

  return (
    <>
      a{" "}
      <a
        href={`mailto:${legalConfig.contactEmail}`}
        className="font-bold text-[#a772ca] underline-offset-4 hover:underline"
      >
        {legalConfig.contactEmail}
      </a>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-7">
      <h2 className="text-xl font-black tracking-[-0.02em] sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[#b8b5bd] sm:text-base">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#8a62ab]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <StoreHeader />

      <section className="border-b border-white/10 bg-[#151317]">
        <div className="mx-auto max-w-[52rem] px-4 py-10 sm:px-6 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#8f8b94] sm:text-base">{intro}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#68656c]">
            Última actualización: {legalConfig.lastUpdated}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[52rem] space-y-8 px-4 py-10 sm:px-6 lg:py-14">
        {children}

        <section className="rounded-[2rem] border border-white/10 bg-[#151317] p-6 sm:p-8">
          <h2 className="text-xl font-black tracking-[-0.02em]">¿Dudas sobre tus datos?</h2>
          <p className="mt-3 text-sm leading-7 text-[#b8b5bd]">
            Escribinos <ContactChannel /> y te respondemos. También podés leer{" "}
            <Link href="/privacidad" className="font-bold text-white underline-offset-4 hover:underline">
              la política de privacidad
            </Link>{" "}
            y{" "}
            <Link href="/cookies" className="font-bold text-white underline-offset-4 hover:underline">
              la de cookies
            </Link>
            .
          </p>
        </section>
      </div>

      <StoreFooter />
    </main>
  );
}
