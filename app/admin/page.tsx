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
      <header className="rounded-[2rem] border border-[#441a66]/10 bg-white shadow-[0_18px_60px_rgba(16,9,27,0.07)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a62ab]">Dashboard</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#441a66]">Pulso del taller</h1>
            <p className="mt-2 max-w-2xl text-[#545454]">
              Vista rápida para saber qué producir, cuánto se vendió y qué necesita atención.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/calculadora"
              className="rounded-full border border-[#441a66]/20 bg-white px-5 py-3 text-center text-sm font-semibold text-[#441a66] transition hover:border-[#441a66]/40"
            >
              Calculadora de precios
            </Link>
            <Link
              href="/admin/pedidos"
              className="rounded-full bg-[#441a66] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#6f2fa3]"
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

      <section className="rounded-[2rem] border border-[#441a66]/10 bg-white shadow-[0_18px_60px_rgba(16,9,27,0.07)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b6472]">Tira de producción</p>
            <h2 className="mt-2 text-2xl font-black text-[#441a66]">Últimos pedidos</h2>
          </div>
          <Link href="/admin/pedidos" className="text-sm font-semibold text-[#8a62ab]">
            Ver todos
          </Link>
        </div>

        <div className="mt-5 divide-y divide-[#441a66]/10">
          {latestOrders?.length ? (
            latestOrders.map((order) => (
              <article key={order.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold">{order.client_name}</p>
                  <p className="text-sm text-[#545454]">{order.channel} · {money(Number(order.total))}</p>
                </div>
                <StatusPill status={order.status} />
                <StatusPill status={order.payment_status} />
              </article>
            ))
          ) : (
            <p className="py-8 text-sm text-[#545454]">Todavía no hay pedidos cargados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
