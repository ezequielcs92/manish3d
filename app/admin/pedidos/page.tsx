import { StatusPill } from "@/components/admin/status-pill";
import { createManualOrder, updateOrderStatus } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/server";

const statuses = ["pendiente", "produccion", "listo", "enviado", "entregado", "cancelado"];

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, client_name, client_phone, channel, status, total, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <section className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a15f1b]">Pedidos</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cola de producción</h1>
        <div className="mt-6 space-y-3">
          {orders?.length ? (
            orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-black/10 bg-[#fff8ef] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">{order.client_name}</p>
                    <p className="text-sm text-[#6f5845]">{order.channel} · {order.client_phone ?? "sin teléfono"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={order.status} />
                    <StatusPill status={order.payment_status} />
                    <span className="font-mono text-sm font-semibold tabular-nums">{money(Number(order.total))}</span>
                  </div>
                </div>
                <form action={updateOrderStatus} className="mt-4 flex gap-2">
                  <input type="hidden" name="id" value={order.id} />
                  <select name="status" defaultValue={order.status} className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-[#f4eadc] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a15f1b]">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <button className="rounded-full bg-[#21170f] px-4 py-2 text-sm font-semibold text-[#fff7ed]">Actualizar</button>
                </form>
              </article>
            ))
          ) : (
            <p className="rounded-3xl border border-black/10 bg-[#fff8ef] p-8 text-sm text-[#6f5845]">No hay pedidos cargados.</p>
          )}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <h2 className="text-2xl font-semibold">Pedido manual</h2>
        <p className="mt-2 text-sm text-[#6f5845]">Para ventas de Instagram, WhatsApp, feria o MercadoLibre.</p>
        <form action={createManualOrder} className="mt-5 space-y-4">
          <input name="client_name" required placeholder="Cliente" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <input name="client_phone" placeholder="Teléfono" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <input name="client_email" type="email" placeholder="Email" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <select name="channel" defaultValue="whatsapp" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]">
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="mercadolibre">MercadoLibre</option>
            <option value="feria">Feria</option>
            <option value="tienda">Tienda</option>
          </select>
          <input name="total" required type="number" min="0" step="0.01" placeholder="Total" className="w-full rounded-2xl border border-black/10 bg-[#f4eadc] px-4 py-3 outline-none focus:ring-2 focus:ring-[#a15f1b]" />
          <button className="w-full rounded-full bg-[#21170f] px-5 py-3 text-sm font-semibold text-[#fff7ed] transition hover:bg-[#3a2a1e]">Crear pedido</button>
        </form>
      </aside>
    </div>
  );
}
