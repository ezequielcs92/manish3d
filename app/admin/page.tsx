import Link from "next/link";
import { MetricCard } from "@/components/admin/metric-card";
import { StatusPill } from "@/components/admin/status-pill";
import { createClient } from "@/lib/supabase/server";

const monthlyGoal = 2000000;

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminPage() {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ count: pendingOrders }, { data: paidOrders }, { count: activeProducts }, { data: latestOrders }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).neq("status", "entregado"),
      supabase
        .from("orders")
        .select("total")
        .eq("payment_status", "pagado")
        .gte("created_at", startOfMonth.toISOString()),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
      supabase
        .from("orders")
        .select("id, client_name, channel, status, total, payment_status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const billed = paidOrders?.reduce((sum, order) => sum + Number(order.total), 0) ?? 0;
  const progress = Math.min(100, Math.round((billed / monthlyGoal) * 100));

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a15f1b]">Dashboard</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Pulso del taller</h1>
            <p className="mt-2 max-w-2xl text-[#6f5845]">
              Vista rápida para saber qué producir, cuánto se vendió y qué necesita atención.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/calculadora"
              className="rounded-full border border-[#21170f]/20 bg-white px-5 py-3 text-center text-sm font-semibold text-[#21170f] transition hover:border-[#21170f]/40"
            >
              Calculadora de precios
            </Link>
            <Link
              href="/admin/pedidos"
              className="rounded-full bg-[#21170f] px-5 py-3 text-center text-sm font-semibold text-[#fff7ed] transition hover:bg-[#3a2a1e]"
            >
              Cargar pedido
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Facturación mes" value={money(billed)} detail={`${progress}% de la meta ${money(monthlyGoal)}`} />
        <MetricCard label="Pedidos activos" value={String(pendingOrders ?? 0)} detail="Pendientes, en producción, listos o enviados" />
        <MetricCard label="Productos activos" value={String(activeProducts ?? 0)} detail="Visibles para tienda pública" />
      </section>

      <section className="rounded-[2rem] border border-black/10 bg-[#fbf4ea] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6b4e]">Tira de producción</p>
            <h2 className="mt-2 text-2xl font-semibold">Últimos pedidos</h2>
          </div>
          <Link href="/admin/pedidos" className="text-sm font-semibold text-[#a15f1b]">
            Ver todos
          </Link>
        </div>

        <div className="mt-5 divide-y divide-black/10">
          {latestOrders?.length ? (
            latestOrders.map((order) => (
              <article key={order.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold">{order.client_name}</p>
                  <p className="text-sm text-[#6f5845]">{order.channel} · {money(Number(order.total))}</p>
                </div>
                <StatusPill status={order.status} />
                <StatusPill status={order.payment_status} />
              </article>
            ))
          ) : (
            <p className="py-8 text-sm text-[#6f5845]">Todavía no hay pedidos cargados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
