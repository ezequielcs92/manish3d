import { StatusPill } from "@/components/admin/status-pill";
import { createMaterial } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ProduccionPage() {
  const supabase = await createClient();
  const [{ data: orders }, { data: materials }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, client_name, status, channel, created_at")
      .in("status", ["pendiente", "produccion", "listo"])
      .order("created_at", { ascending: true }),
    supabase
      .from("materials")
      .select("id, name, type, color, stock_grams, cost_per_kg, low_stock_threshold")
      .order("name", { ascending: true }),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <section className="space-y-6">
        <header className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a15f1b]">Producción</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Qué imprimir ahora</h1>
        </header>

        <div className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
          <h2 className="text-2xl font-semibold">Cola activa</h2>
          <div className="mt-5 space-y-3">
            {orders?.length ? (
              orders.map((order) => (
                <article key={order.id} className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-[#fff8ef] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{order.client_name}</p>
                    <p className="text-sm text-[#6f5845]">Canal: {order.channel}</p>
                  </div>
                  <StatusPill status={order.status} />
                </article>
              ))
            ) : (
              <p className="text-sm text-[#6f5845]">No hay trabajos pendientes de producción.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
          <h2 className="text-2xl font-semibold">Materiales</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {materials?.length ? (
              materials.map((material) => {
                const lowStock = Number(material.stock_grams) <= Number(material.low_stock_threshold);
                return (
                  <article key={material.id} className="rounded-3xl border border-black/10 bg-[#fff8ef] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{material.name}</p>
                        <p className="text-sm text-[#6f5845]">{material.type} · {material.color ?? "sin color"}</p>
                      </div>
                      {lowStock ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-900 ring-1 ring-red-200">bajo</span> : null}
                    </div>
                    <p className="mt-4 font-mono text-2xl font-semibold tabular-nums">{Number(material.stock_grams)} g</p>
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-[#6f5845]">No hay materiales cargados.</p>
            )}
          </div>
        </div>
      </section>

      <aside className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6 xl:self-start">
        <h2 className="text-2xl font-semibold">Nuevo material</h2>
        <form action={createMaterial} className="mt-5 space-y-4">
          <input name="name" required placeholder="Nombre" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <select name="type" defaultValue="PLA" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]">
            <option value="PLA">PLA</option>
            <option value="PETG">PETG</option>
            <option value="TPU">TPU</option>
            <option value="otro">Otro</option>
          </select>
          <input name="color" placeholder="Color" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <input name="stock_grams" required type="number" min="0" step="0.01" placeholder="Stock en gramos" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <input name="cost_per_kg" required type="number" min="0" step="0.01" placeholder="Costo por kg" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <input name="low_stock_threshold" required type="number" min="0" step="0.01" placeholder="Alerta bajo stock" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <button className="w-full rounded-full bg-[#21170f] px-5 py-3 text-sm font-semibold text-[#fff7ed] transition hover:bg-[#3a2a1e]">Guardar material</button>
        </form>
      </aside>
    </div>
  );
}
