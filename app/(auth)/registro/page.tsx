import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";

export const metadata: Metadata = {
  title: "Crear cuenta | Manish 3D",
  description: "Creá tu cuenta para comprar más rápido y seguir el estado de tus pedidos.",
};

const benefits = [
  "Seguí el estado de cada pedido, de pendiente a entregado.",
  "Guardá tus datos de envío y no los cargues de nuevo.",
  "Tu historial de compras siempre a mano.",
];

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0d0c0f] text-white">
      <StoreHeader />
      <section className="flex flex-1 items-center justify-center px-4 py-14 sm:px-6 lg:py-20">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-[#151317] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Tu cuenta</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Crear cuenta</h1>

            <ul className="mt-5 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2.5 text-sm leading-6 text-[#8f8b94]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-1 size-4 shrink-0 text-[#a772ca]" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Suspense fallback={null}>
                <AuthForm mode="registro" />
              </Suspense>
            </div>

            <p className="mt-5 text-xs leading-6 text-[#77727c]">
              Al crear tu cuenta aceptás nuestra{" "}
              <Link href="/privacidad" className="font-semibold text-[#a772ca] underline-offset-4 hover:underline">
                política de protección de datos
              </Link>{" "}
              y la{" "}
              <Link href="/cookies" className="font-semibold text-[#a772ca] underline-offset-4 hover:underline">
                política de cookies
              </Link>
              .
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-[#8f8b94]">
            ¿Ya tenés cuenta?{" "}
            <Link className="font-bold text-white underline-offset-4 transition hover:text-[#a772ca] hover:underline" href="/login">
              Ingresá
            </Link>
          </p>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
