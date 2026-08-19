import Link from "next/link";
import { ProductCard } from "@/components/tienda/product-card";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";
import { hasSupabaseEnv } from "@/lib/env";
import { demoProducts } from "@/lib/store/demo-products";
import { createClient } from "@/lib/supabase/server";
import type { StoreProduct } from "@/lib/store/types";

const filters = [
  ["Todos", "/tienda", undefined],
  ["Línea Calma", "/tienda?linea=calma", "calma"],
  ["Línea Lectura", "/tienda?linea=lectura", "lectura"],
  ["Personalizados", "/tienda?linea=servicio", "servicio"],
] as const;

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ linea?: string }>;
}) {
  const { linea } = await searchParams;
  let products: StoreProduct[] = demoProducts;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("id, name, slug, line, description, price, stock, images")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (linea === "calma" || linea === "lectura" || linea === "servicio") {
      query = query.eq("line", linea);
    }

    const { data } = await query;
    products = data?.map((product) => ({ ...product, price: Number(product.price) })) ?? [];
  } else if (linea === "calma" || linea === "lectura" || linea === "servicio") {
    products = demoProducts.filter((product) => product.line === linea);
  }

  const activeLabel = filters.find(([, , value]) => value === linea)?.[0] ?? "Todos los productos";

  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <StoreHeader />
      <section className="border-b border-white/10 bg-[#151317]">
        <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Catálogo Manish 3D</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-6xl">{activeLabel}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8f8b94] sm:text-base">Diseño, producción local y piezas creadas para disfrutarse todos los días.</p>
            </div>
            <p className="text-sm font-semibold text-[#8f8b94]">{products.length} {products.length === 1 ? "producto" : "productos"}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-2">
          {filters.map(([label, href, value]) => {
            const active = value === linea || (!value && !linea);
            return (
              <Link key={href} href={href} className={`shrink-0 rounded-lg border px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] transition ${active ? "border-[#6f2fa3] bg-[#6f2fa3] text-white" : "border-white/10 bg-[#18161a] text-[#aaa6ae] hover:border-white/30 hover:text-white"}`}>
                {label}
              </Link>
            );
          })}
        </div>

        {products.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#151317] px-6 py-16 text-center">
            <p className="text-xl font-bold">Todavía no hay productos en esta categoría.</p>
            <p className="mt-2 text-sm text-[#8f8b94]">Estamos preparando nuevas piezas. Consultanos por un diseño personalizado.</p>
            <Link href="/tienda?linea=servicio" className="mt-6 inline-flex rounded-lg bg-[#6f2fa3] px-6 py-3 text-sm font-bold">Ver servicio personalizado</Link>
          </div>
        )}
      </section>
      <StoreFooter />
    </main>
  );
}
