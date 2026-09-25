import Link from "next/link";
import { ProductCard } from "@/components/tienda/product-card";
import { StoreFooter } from "@/components/tienda/store-footer";
import { StoreHeader } from "@/components/tienda/store-header";
import { hasSupabaseEnv } from "@/lib/env";
import { demoProducts } from "@/lib/store/demo-products";
import { createClient } from "@/lib/supabase/server";
import { lineHref, productLines } from "@/lib/store/lines";
import type { StoreProduct } from "@/lib/store/types";

const categories = productLines.map((line, index) => ({
  name: line.home.name,
  text: line.home.text,
  href: lineHref(line.slug),
  number: String(index + 1).padStart(2, "0"),
  // "A tu medida" no es una colección más: cierra la grilla a lo ancho.
  className: `${line.home.gradient} ${line.slug === "servicio" ? "sm:col-span-2 lg:col-span-3" : ""}`,
}));

const benefits = [
  ["Hecho localmente", "Producimos cada pieza en zona norte de Buenos Aires."],
  ["Compra segura", "Pago protegido y seguimiento de tu pedido."],
  ["Envíos coordinados", "Entrega en GBA y despachos a todo el país."],
  ["Atención directa", "Hablás con quienes diseñan y fabrican."],
];

async function getFeaturedProducts() {
  if (!hasSupabaseEnv()) return demoProducts;

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, line, description, price, stock, images")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (data?.map((product) => ({
    ...product,
    price: product.price === null ? null : Number(product.price),
  })) ?? []) as StoreProduct[];
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0c0f] text-white">
      <StoreHeader />

      <section className="relative isolate border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(111,47,163,0.32),transparent_34%),radial-gradient(circle_at_18%_90%,rgba(68,26,102,0.18),transparent_30%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="relative mx-auto grid min-h-[38rem] max-w-[90rem] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-20">
          <div className="animate-rise-in max-w-3xl">
            <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#b893d4]">
              <span className="h-px w-10 bg-[#8a62ab]" />
              Diseño e impresión 3D
            </div>
            <h1 className="max-w-[12ch] text-[clamp(3rem,7vw,6.8rem)] font-black leading-[0.93] tracking-[-0.065em]">
              Ideas que toman <span className="text-[#a772ca]">forma.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#b8b5bd] sm:text-xl sm:leading-8">
              Objetos de autor, accesorios útiles y piezas personalizadas. Diseñamos y producimos en 3D, una capa a la vez.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/tienda" className="shine-hover inline-flex min-h-14 items-center justify-center rounded-lg bg-[#6f2fa3] px-8 text-sm font-extrabold uppercase tracking-[0.1em] text-white transition hover:bg-[#8544b5]">
                Explorar tienda
              </Link>
              <Link href="/tienda?linea=servicio" className="inline-flex min-h-14 items-center justify-center rounded-lg border border-white/20 px-8 text-sm font-extrabold uppercase tracking-[0.1em] transition hover:border-white/50 hover:bg-white/5">
                Cotizar una pieza
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[34rem] animate-rise-in [animation-delay:140ms]">
            <div className="absolute inset-[8%] rounded-full border border-[#a772ca]/25" />
            <div className="absolute inset-[18%] animate-[spin_24s_linear_infinite] rounded-[32%] border border-dashed border-[#a772ca]/35" />
            <div className="absolute inset-[26%] rotate-12 rounded-[28%] bg-gradient-to-br from-[#8a62ab] via-[#441a66] to-[#1b0b26] shadow-[0_0_110px_rgba(111,47,163,0.45)]" />
            <div className="absolute inset-[30%] -rotate-6 rounded-[25%] border border-white/20 bg-white/5 backdrop-blur-md" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-[clamp(4rem,10vw,8.5rem)] font-black tracking-[-0.1em] text-white drop-shadow-2xl">3D</span>
            </div>
            <div className="absolute bottom-[8%] right-0 rounded-xl border border-white/10 bg-[#17151a]/90 px-5 py-4 shadow-2xl backdrop-blur">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#a772ca]">Fabricación propia</p>
              <p className="mt-1 font-bold">Diseñado para vos</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#151317]">
        <div className="mx-auto grid max-w-[90rem] grid-cols-2 divide-x divide-y divide-white/10 px-4 sm:px-6 lg:grid-cols-4 lg:divide-y-0 lg:px-10">
          {benefits.map(([title, text]) => (
            <div key={title} className="px-4 py-6 sm:px-6">
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="mt-1 text-xs leading-5 text-[#8f8b94]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Encontrá lo tuyo</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Comprá por categoría</h2>
          </div>
          <Link href="/tienda" className="text-sm font-bold text-[#b8b5bd] transition hover:text-white">Ver todo el catálogo →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.name} href={category.href} className={`group relative min-h-72 overflow-hidden rounded-2xl bg-gradient-to-br p-7 ${category.className}`}>
              <span className="absolute right-5 top-2 text-[7rem] font-black leading-none text-white/[0.06]">{category.number}</span>
              <div className="absolute -bottom-16 -right-12 size-52 rounded-full border-[34px] border-white/[0.06] transition duration-500 group-hover:scale-110" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">{category.number} / Colección</span>
                <div>
                  <h3 className="text-3xl font-black tracking-[-0.04em]">{category.name}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{category.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Ver productos <span className="transition group-hover:translate-x-1">→</span></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111013]">
        <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a772ca]">Recién salidos de la impresora</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Productos destacados</h2>
            </div>
            <Link href="/tienda" className="text-sm font-bold text-[#b8b5bd] transition hover:text-white">Ir a la tienda →</Link>
          </div>
          {products.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center">
              <p className="text-lg font-bold">El primer lanzamiento está en preparación.</p>
              <p className="mt-2 text-sm text-[#8f8b94]">Mientras tanto, podés pedir una pieza personalizada.</p>
              <Link href="/tienda?linea=servicio" className="mt-6 inline-flex rounded-lg bg-[#6f2fa3] px-6 py-3 text-sm font-bold">Consultar servicio</Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-[#8a62ab]/30 bg-[#201129] px-6 py-12 sm:px-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:px-14 lg:py-16">
          <div className="absolute -right-24 -top-36 size-96 rounded-full bg-[#8a62ab]/25 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c49cde]">Impresión 3D personalizada</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-6xl">¿Tenés una idea? La hacemos tangible.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#c6bccc] sm:text-base">Mandanos tu archivo STL, una foto o simplemente contanos qué necesitás. Te acompañamos desde el diseño hasta la pieza terminada.</p>
          </div>
          <Link href="/tienda?linea=servicio" className="relative mt-8 inline-flex min-h-14 items-center justify-center rounded-lg bg-white px-8 text-sm font-extrabold uppercase tracking-[0.08em] text-[#201129] transition hover:bg-[#eee7f2] lg:mt-0">Pedir cotización</Link>
        </div>
      </section>

      {/* La Resolución 424/2020 exige el botón de arrepentimiento visible en la
          home, no solo enterrado en los legales. */}
      <section className="border-t border-white/10 bg-[#0d0c0f]">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-4 px-4 py-7 sm:flex-row sm:px-6 lg:px-10">
          <p className="text-center text-sm text-[#8f8b94] sm:text-left">
            ¿Te arrepentiste de una compra? Tenés 10 días para cancelarla, sin costo.
          </p>
          <Link
            href="/arrepentimiento"
            className="inline-flex shrink-0 items-center rounded-lg border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] transition hover:border-[#8a62ab] hover:bg-[#6f2fa3]/15"
          >
            Botón de arrepentimiento
          </Link>
        </div>
      </section>

      <StoreFooter />
    </main>
  );
}
