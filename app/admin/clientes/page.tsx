import { createClient } from "@/lib/supabase/server";

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, phone, email, zone, client_type, total_spent, created_at")
    .order("created_at", { ascending: false });

  const { data: guestOrders } = await supabase
    .from("orders")
    .select("id, client_name, client_phone, client_email, total, channel, created_at")
    .is("client_id", null)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a15f1b]">Clientes</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">CRM inicial</h1>
        <p className="mt-2 max-w-2xl text-[#6f5845]">
          En esta fase se centraliza información básica y ventas por canales externos.
        </p>
      </header>

      <section className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <h2 className="text-2xl font-semibold">Clientes registrados</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clients?.length ? (
            clients.map((client) => (
              <article key={client.id} className="rounded-3xl border border-black/10 bg-[#fff8ef] p-4">
                <p className="font-semibold">{client.name}</p>
                <p className="mt-1 text-sm text-[#6f5845]">{client.phone ?? client.email ?? "sin contacto"}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>{client.client_type}</span>
                  <span className="font-mono font-semibold tabular-nums">{money(Number(client.total_spent))}</span>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-[#6f5845]">Todavía no hay fichas de clientes.</p>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <h2 className="text-2xl font-semibold">Ventas sin cuenta</h2>
        <div className="mt-5 divide-y divide-black/10">
          {guestOrders?.length ? (
            guestOrders.map((order) => (
              <article key={order.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-semibold">{order.client_name}</p>
                  <p className="text-sm text-[#6f5845]">{order.channel} · {order.client_phone ?? order.client_email ?? "sin contacto"}</p>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums">{money(Number(order.total))}</span>
              </article>
            ))
          ) : (
            <p className="py-6 text-sm text-[#6f5845]">No hay ventas invitadas todavía.</p>
          )}
        </div>
      </section>
    </div>
  );
}
