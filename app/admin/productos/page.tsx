import { createProduct, updateProduct } from "@/lib/admin/actions";
import { getLine, productLines } from "@/lib/store/lines";
import { createClient } from "@/lib/supabase/server";

const celdaClass = "w-24 rounded-lg border border-[#441a66]/10 bg-[#f5f2f8] px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#8a62ab]";

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
    .select("id, name, slug, line, extra_lines, price, cost, stock, weight_grams, images, active")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <section className="rounded-[2rem] border border-[#441a66]/10 bg-white shadow-[0_18px_60px_rgba(16,9,27,0.07)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a62ab]">Productos</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#441a66]">Catálogo propio</h1>
        <div className="mt-6 overflow-hidden rounded-3xl border border-[#441a66]/10">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-[#f1ebf6] text-xs uppercase tracking-[0.16em] text-[#545454]">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#441a66]/10 bg-[#faf7fc]">
              {products?.length ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-[#6b6472]">/{product.slug}</p>
                      <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
                        {product.price === null ? "A consultar" : money(Number(product.price))}
                        <span className="ml-2 text-xs font-normal text-[#6b6472]">
                          {product.stock === null ? "a pedido" : `${product.stock} en stock`}
                        </span>
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {getLine(product.line)?.badge ?? product.line}
                      {product.extra_lines?.length ? (
                        <p className="mt-1 text-xs text-[#6b6472]">
                          También en {product.extra_lines.map((slug: string) => getLine(slug)?.nav ?? slug).join(", ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4" colSpan={4}>
                      <form action={updateProduct} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={product.id} />
                        <select name="price_mode" defaultValue={product.price === null ? "consultar" : "precio"} className={celdaClass}>
                          <option value="precio">Con precio</option>
                          <option value="consultar">A consultar</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs text-[#6b6472]">
                          Precio
                          <input name="price" type="number" min="0" step="0.01" defaultValue={product.price ?? ""} className={celdaClass} />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-[#6b6472]">
                          Costo
                          <input name="cost" type="number" min="0" step="0.01" defaultValue={Number(product.cost)} className={celdaClass} />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-[#6b6472]">
                          Stock
                          <input name="stock" type="number" min="0" placeholder="a pedido" defaultValue={product.stock ?? ""} className={celdaClass} />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-[#6b6472]">
                          Peso g
                          <input name="weight_grams" type="number" min="0" defaultValue={product.weight_grams ?? ""} className={celdaClass} />
                        </label>
                        <label className="flex items-center gap-1 text-xs font-medium text-[#545454]">
                          <input name="active" type="checkbox" defaultChecked={product.active} /> Activo
                        </label>
                        <details className="text-xs text-[#6b6472]">
                          <summary className="cursor-pointer select-none">También en…</summary>
                          <div className="mt-2 flex flex-wrap gap-3">
                            {productLines
                              .filter((line) => line.slug !== product.line)
                              .map((line) => (
                                <label key={line.slug} className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    name="extra_lines"
                                    value={line.slug}
                                    defaultChecked={product.extra_lines?.includes(line.slug)}
                                  />
                                  {line.nav}
                                </label>
                              ))}
                          </div>
                        </details>
                        <label className="flex items-center gap-1 text-xs text-[#6b6472]">
                          Fotos ({product.images?.length ?? 0}/6)
                          <input
                            name="image_files"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            multiple
                            className="w-44 text-xs file:mr-2 file:rounded-full file:border-0 file:bg-[#ece4f3] file:px-3 file:py-1 file:text-xs file:font-bold"
                          />
                        </label>
                        <button className="rounded-full bg-[#441a66] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#6f2fa3]">
                          Guardar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-[#545454]" colSpan={6}>No hay productos cargados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-[2rem] border border-[#441a66]/10 bg-white shadow-[0_18px_60px_rgba(16,9,27,0.07)] p-6">
        <h2 className="text-2xl font-black text-[#441a66]">Nuevo producto</h2>
        <form action={createProduct} className="mt-5 space-y-4">
          <input name="name" required placeholder="Nombre" className="w-full rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]" />
          <input name="slug" required placeholder="slug-del-producto" className="w-full rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]" />
          <select name="line" required className="w-full rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]">
            {productLines.map((line) => (
              <option key={line.slug} value={line.slug}>
                {line.badge}
              </option>
            ))}
          </select>
           <textarea name="description" placeholder="Descripción" className="min-h-28 w-full rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]" />
          <div className="rounded-2xl border border-dashed border-[#441a66]/15 bg-[#f5f2f8] p-4">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#6b6472]">
              Fotos del producto
              <input
                name="image_files"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#441a66] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
              />
            </label>
            <p className="mt-2 text-xs text-[#6b6472]">Hasta 6 fotos, 5 MB cada una. JPG, PNG, WebP o AVIF.</p>
          </div>
          <textarea name="image_urls" placeholder="O pegá URLs de imágenes ya publicadas, una por línea" className="min-h-20 w-full rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8a62ab]" />
          <fieldset className="flex flex-wrap gap-4 text-sm font-medium text-[#545454]">
            <label className="flex items-center gap-2">
              <input type="radio" name="price_mode" value="precio" defaultChecked /> Con precio
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="price_mode" value="consultar" /> Precio a consultar
            </label>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <input name="price" type="number" min="0" step="0.01" placeholder="Precio" className="rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]" />
            <input name="cost" type="number" min="0" step="0.01" placeholder="Costo" className="rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="stock" type="number" min="0" placeholder="Stock vacío = a pedido" className="rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]" />
            <input name="weight_grams" type="number" min="0" placeholder="Peso en gramos" className="rounded-2xl border border-[#441a66]/10 bg-[#f5f2f8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#8a62ab]" />
          </div>
          <p className="-mt-1 text-xs text-[#6b6472]">El peso se usa para cotizar el envío con Andreani. Sin peso, ese producto no se puede cotizar.</p>
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b6472]">También aparece en</legend>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#545454]">
              {productLines.map((line) => (
                <label key={line.slug} className="flex items-center gap-1.5">
                  <input type="checkbox" name="extra_lines" value={line.slug} /> {line.nav}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm font-medium text-[#545454]">
            <input name="active" type="checkbox" defaultChecked /> Activo en tienda
          </label>
          <button className="w-full rounded-full bg-[#441a66] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6f2fa3]">Guardar producto</button>
        </form>
      </aside>
    </div>
  );
}
