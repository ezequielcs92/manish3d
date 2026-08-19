import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#f7f1e8] px-6 py-16">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-700">
          Manish 3D
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Ingresar</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Acceso para clientes y equipo interno según el rol configurado.
        </p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-600">
          ¿No tenés cuenta?{" "}
          <Link className="font-semibold text-zinc-950" href="/registro">
            Registrate
          </Link>
        </p>
      </section>
    </main>
  );
}
