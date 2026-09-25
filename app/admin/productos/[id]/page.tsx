import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm, type AdminProduct } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, line, extra_lines, description, price, cost, stock, weight_grams, images, active")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const product: AdminProduct = {
    ...data,
    price: data.price === null ? null : Number(data.price),
    cost: data.cost === null ? null : Number(data.cost),
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/productos" className="text-sm font-bold text-[#8b8490] hover:text-[#6f2fa3]">
            ← Productos
          </Link>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#10091b]">{product.name}</h1>
        </div>
        {product.active ? (
          <Link href={`/producto/${product.slug}`} target="_blank" className="text-sm font-bold text-[#6f2fa3] hover:underline">
            Ver en la tienda →
          </Link>
        ) : null}
      </header>
      <ProductForm product={product} />
    </div>
  );
}
