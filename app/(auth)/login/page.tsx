import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";

export const metadata: Metadata = {
  title: "Ingresar | Manish 3D",
  description: "Entrá a tu cuenta para seguir tus pedidos y comprar más rápido.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0d0c0f] text-white">
      <StoreHeader />
      <section className="flex flex-1 items-center justify-center px-4 py-14 sm:px-6 lg:py-20">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-[#151317] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Tu cuenta</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Ingresar</h1>
            <p className="mt-3 text-sm leading-6 text-[#8f8b94]">
              Seguí tus pedidos, guardá tus datos de envío y comprá sin volver a cargarlos.
            </p>

            <div className="mt-8">
              <Suspense fallback={null}>
                <AuthForm mode="login" />
              </Suspense>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[#8f8b94]">
            ¿No tenés cuenta?{" "}
            <Link className="font-bold text-white underline-offset-4 transition hover:text-[#a772ca] hover:underline" href="/registro">
              Creá una
            </Link>
          </p>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
