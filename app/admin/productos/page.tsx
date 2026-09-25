import Link from "next/link";
import { IconPlus } from "@/components/admin/icons";
import type { AdminProduct } from "@/components/admin/product-form";
import { ProductsTable } from "@/components/admin/products-table";
import { createClient } from "@/lib/supabase/server";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; guardado?: string }>;
}) {
  const { estado, guardado } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, line, extra_lines, description, price, cost, stock, weight_grams, images, active")
    .order("created_at", { ascending: false });

  const products: AdminProduct[] = (data ?? []).map((product) => ({
    ...product,
    price: product.price === null ? null : Number(product.price),
    cost: product.cost === null ? null : Number(product.cost),
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a62ab]">Catálogo</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-[#10091b]">Productos</h1>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6f2fa3] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(111,47,163,0.3)] transition hover:bg-[#8544b5]"
        >
          <IconPlus className="size-4" /> Agregar producto
        </Link>
      </header>

      {guardado ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          “{guardado}” quedó guardado.
        </p>
      ) : null}

      <ProductsTable products={products} estadoInicial={estado} />
    </div>
  );
}
