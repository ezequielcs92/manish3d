import Image from "next/image";
import Link from "next/link";

export function StoreFooter() {
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
            <Link href="/tienda?linea=calma" className="hover:text-white">Línea Calma</Link>
            <Link href="/tienda?linea=lectura" className="hover:text-white">Línea Lectura</Link>
            <Link href="/tienda?linea=servicio" className="hover:text-white">Pedidos personalizados</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a772ca]">Mi compra</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#aaa6ae]">
            <Link href="/carrito" className="hover:text-white">Carrito</Link>
            <Link href="/login" className="hover:text-white">Ingresar</Link>
            <Link href="/registro" className="hover:text-white">Crear cuenta</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-[#68656c]">© 2026 Manish 3D. Hecho en Argentina.</div>
    </footer>
  );
}
