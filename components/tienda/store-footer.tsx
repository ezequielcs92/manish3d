import Image from "next/image";
import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";
import { lineHref, productLines } from "@/lib/store/lines";
import { createClient } from "@/lib/supabase/server";

async function hasSession() {
  if (!hasSupabaseEnv()) return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

export async function StoreFooter() {
  const loggedIn = await hasSession();

  return (
    <footer className="border-t border-white/10 bg-[#09080a] text-white">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_0.65fr_0.65fr] lg:px-10">
        <div>
          <Image src="/brand/logo-header-exact.png" alt="Manish 3D" width={228} height={40} className="h-auto w-44" unoptimized />
          <p className="mt-5 max-w-md text-sm leading-6 text-[#8f8b94]">Diseño y fabricación de productos impresos en 3D. Piezas con identidad, hechas localmente.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a772ca]">Tienda</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#aaa6ae]">
            <Link href="/tienda" className="hover:text-white">Todos los productos</Link>
            {productLines.map((line) => (
              <Link key={line.slug} href={lineHref(line.slug)} className="hover:text-white">{line.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a772ca]">Mi compra</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#aaa6ae]">
            <Link href="/carrito" className="hover:text-white">Carrito</Link>
            {loggedIn ? (
              <Link href="/cuenta" className="hover:text-white">Mi cuenta</Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-white">Ingresar</Link>
                <Link href="/registro" className="hover:text-white">Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-3 text-xs text-[#68656c] sm:flex-row sm:justify-between">
          <p>© 2026 Manish 3D. Hecho en Argentina.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/privacidad" className="transition hover:text-white">Protección de datos</Link>
            <Link href="/cookies" className="transition hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
