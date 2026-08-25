import { createProduct } from "@/lib/admin/actions";
import { productLines } from "@/lib/store/lines";
import { createClient } from "@/lib/supabase/server";

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, line, price, cost, stock, active")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <section className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a15f1b]">Productos</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Catálogo propio</h1>
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/10">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-[#efe0cb] text-xs uppercase tracking-[0.16em] text-[#6f5845]">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 bg-[#fff8ef]">
              {products?.length ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-[#8b6b4e]">/{product.slug}</p>
                    </td>
                    <td className="px-4 py-4">{product.line}</td>
                    <td className="px-4 py-4 font-mono tabular-nums">{money(Number(product.price))}</td>
                    <td className="px-4 py-4 font-mono tabular-nums">{money(Number(product.cost))}</td>
                    <td className="px-4 py-4">{product.stock ?? "a pedido"}</td>
                    <td className="px-4 py-4">{product.active ? "Activo" : "Oculto"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-[#6f5845]" colSpan={6}>No hay productos cargados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <h2 className="text-2xl font-semibold">Nuevo producto</h2>
        <form action={createProduct} className="mt-5 space-y-4">
          <input name="name" required placeholder="Nombre" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <input name="slug" required placeholder="slug-del-producto" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <select name="line" required className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]">
            {productLines.map((line) => (
              <option key={line.slug} value={line.slug}>
                {line.badge}
              </option>
            ))}
          </select>
           <textarea name="description" placeholder="Descripción" className="min-h-28 w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <textarea name="image_urls" placeholder="URLs de imágenes, una por línea (máximo 6)" className="min-h-24 w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" required type="number" min="0" step="0.01" placeholder="Precio" className="rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
            <input name="cost" type="number" min="0" step="0.01" placeholder="Costo" className="rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="stock" type="number" min="0" placeholder="Stock vacío = a pedido" className="rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
            <input name="weight_grams" type="number" min="0" placeholder="Peso en gramos" className="rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          </div>
          <p className="-mt-1 text-xs text-[#8b6b4e]">El peso se usa para cotizar el envío con Andreani. Sin peso, ese producto no se puede cotizar.</p>
          <label className="flex items-center gap-2 text-sm font-medium text-[#6f5845]">
            <input name="active" type="checkbox" defaultChecked /> Activo en tienda
          </label>
          <button className="w-full rounded-full bg-[#21170f] px-5 py-3 text-sm font-semibold text-[#fff7ed] transition hover:bg-[#3a2a1e]">Guardar producto</button>
        </form>
      </aside>
    </div>
  );
}
