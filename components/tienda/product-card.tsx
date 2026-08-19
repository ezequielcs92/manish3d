import Link from "next/link";
import Image from "next/image";
import { money } from "@/lib/format";
import type { StoreProduct } from "@/lib/store/types";
import { AddToCartButton } from "./add-to-cart-button";

const lineLabel = {
  calma: "Línea Calma",
  lectura: "Línea Lectura",
  servicio: "Servicio",
};

const lineStyle = {
  calma: "from-[#5d237f] to-[#271031] text-white",
  lectura: "from-[#323036] to-[#161419] text-white",
  servicio: "from-[#5a565f] to-[#222025] text-white",
};

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="group flex min-h-[28rem] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#1a181d] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#8a62ab]/60 hover:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <div>
        <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${lineStyle[product.line]}`}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <>
              <div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/20 blur-2xl transition group-hover:scale-125" />
              <div className="absolute bottom-5 h-10 w-44 rounded-full bg-black/20 blur-xl" />
              <div className="relative flex size-24 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-center text-3xl font-black shadow-[0_24px_55px_rgba(0,0,0,0.22)] backdrop-blur transition duration-500 group-hover:-rotate-6 group-hover:scale-110">
                3D
              </div>
            </>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3 px-1">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#a772ca]">
              {lineLabel[product.line]}
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-white">
              <Link href={`/producto/${product.slug}`}>{product.name}</Link>
            </h2>
          </div>
          <p className="shrink-0 text-right text-sm font-black tabular-nums text-white">
            {money(product.price)}
          </p>
        </div>
        <p className="mt-3 line-clamp-2 px-1 text-sm leading-6 text-[#8f8b94]">
          {product.description ?? "Producto de impresión 3D con diseño propio de Manish 3D."}
        </p>
      </div>
      <div className="mt-5 px-1 pb-1">
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
