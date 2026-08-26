import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AddToCartButton } from "@/components/tienda/add-to-cart-button";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";
import { hasSupabaseEnv } from "@/lib/env";
import { money } from "@/lib/format";
import { demoProducts } from "@/lib/store/demo-products";
import { getLine } from "@/lib/store/lines";
import { createClient } from "@/lib/supabase/server";
import type { StoreProduct } from "@/lib/store/types";

type Params = { slug: string };

// cache() evita repetir la consulta: generateMetadata y la página piden el
// mismo producto en el mismo request, y sin esto sería una consulta cada una.
const getProduct = cache(async (slug: string): Promise<StoreProduct | undefined> => {
  if (!hasSupabaseEnv()) return demoProducts.find((item) => item.slug === slug);

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, line, description, price, stock, images")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  return data ? ({ ...data, price: Number(data.price) } as StoreProduct) : undefined;
});

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Producto no encontrado | Manish 3D" };

  const description =
    product.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${product.name}: pieza de diseño propio impresa en 3D por Manish 3D.`;
  const title = `${product.name} | Manish 3D`;
  const image = product.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const line = getLine(product.line);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.manish3d.com").replace(/\/$/, "");

  // Datos estructurados para que Google pueda mostrar precio y disponibilidad
  // directamente en el resultado de búsqueda.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.length ? product.images : undefined,
    sku: product.id,
    url: `${siteUrl}/producto/${product.slug}`,
    brand: { "@type": "Brand", name: "Manish 3D" },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/producto/${product.slug}`,
      priceCurrency: "ARS",
      price: product.price,
      availability:
        product.stock === null || product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="min-h-screen bg-[#0d0c0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StoreHeader />
      <section className="mx-auto grid max-w-[90rem] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-16">
        <div className="relative flex min-h-[30rem] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#211529] via-[#441a66] to-[#8a62ab] p-8 text-center text-sm font-bold uppercase tracking-[0.28em] text-white shadow-[0_30px_100px_rgba(0,0,0,0.28)] lg:min-h-[38rem]">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <>
              <div className="absolute -right-20 top-10 size-80 rounded-full bg-white/12 blur-3xl" />
              <div className="absolute -bottom-24 left-10 size-96 rounded-full bg-[#8a62ab]/50 blur-3xl" />
              <div className="animate-float-slow relative grid size-56 place-items-center rounded-3xl border border-white/20 bg-white/10 text-6xl font-black shadow-[0_35px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                3D
              </div>
            </>
          )}
          <span className="absolute bottom-6 left-6 rounded-lg bg-black/30 px-4 py-2 backdrop-blur">
            {line?.detail ?? product.line}
          </span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171519] p-7 sm:p-10">
          <Link href="/tienda" className="text-sm font-bold text-[#aaa6ae] transition hover:text-white">← Volver a la tienda</Link>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">
            {line?.detail ?? product.line}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">{product.name}</h1>
          <p className="mt-6 text-base leading-8 text-[#aaa6ae]">
            {product.description ?? "Producto de impresión 3D con diseño propio de Manish 3D."}
          </p>
          <div className="mt-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#77727c]">Precio</p>
              <p className="mt-2 text-4xl font-black tabular-nums text-white">{money(product.price)}</p>
            </div>
            <div className="mt-6"><AddToCartButton product={product} /></div>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 text-xs text-[#8f8b94]">
              <p>✓ Producción local</p>
              <p>✓ Compra segura</p>
              <p>✓ Atención directa</p>
              <p>✓ Envíos coordinados</p>
            </div>
          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
