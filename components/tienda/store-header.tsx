import Image from "next/image";
import Link from "next/link";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 text-white">
      <div className="bg-[#6f2fa3] px-4 py-2 text-center text-[0.66rem] font-bold uppercase tracking-[0.13em] sm:text-xs">
        Envíos a todo el país · Producción propia · Atención personalizada
      </div>
      <div className="border-b border-white/10 bg-[#0d0c0f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0">
            <Image src="/brand/logo-header-exact.png" alt="Manish 3D" width={228} height={40} className="h-auto w-36 sm:w-48" priority unoptimized />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#b8b5bd] md:flex">
            <Link className="transition hover:text-white" href="/tienda">Tienda</Link>
            <Link className="transition hover:text-white" href="/tienda?linea=calma">Calma</Link>
            <Link className="transition hover:text-white" href="/tienda?linea=lectura">Lectura</Link>
            <Link className="transition hover:text-white" href="/tienda?linea=servicio">Personalizados</Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/login" aria-label="Ingresar" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#b8b5bd] transition hover:bg-white/5 hover:text-white sm:inline-flex">Ingresar</Link>
            <Link href="/carrito" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-bold transition hover:border-[#8a62ab] hover:bg-[#6f2fa3]/15 sm:px-4">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.3 8H6.1"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
              <span className="hidden sm:inline">Carrito</span>
            </Link>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-6 overflow-x-auto border-t border-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] text-[#8f8b94] md:hidden">
          <Link className="shrink-0 hover:text-white" href="/tienda">Todos</Link>
          <Link className="shrink-0 hover:text-white" href="/tienda?linea=calma">Calma</Link>
          <Link className="shrink-0 hover:text-white" href="/tienda?linea=lectura">Lectura</Link>
          <Link className="shrink-0 hover:text-white" href="/tienda?linea=servicio">Personalizados</Link>
          <Link className="shrink-0 hover:text-white" href="/login">Ingresar</Link>
        </nav>
      </div>
    </header>
  );
}
