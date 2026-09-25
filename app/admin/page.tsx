import Link from "next/link";
import type { ComponentType } from "react";
import { IconArrow, IconBag, IconBell, IconBox, IconMoney, IconPlus, IconUndo, IconUsers } from "@/components/admin/icons";
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

function StatCard({
  title,
  value,
  detail,
  href,
  tone,
  Icon,
}: {
  title: string;
  value: string;
  detail: string;
  href: string;
  tone: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#441a66]/8 bg-white p-6 shadow-[0_10px_30px_rgba(16,9,27,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(68,26,102,0.12)]"
    >
      <div className="flex items-start justify-between">
        <span className={`rounded-xl p-3 ${tone}`}>
          <Icon className="size-6" />
        </span>
        <IconArrow className="size-4 text-[#b8b0c0] transition group-hover:text-[#6f2fa3]" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[#6b6472]">{title}</p>
      <p className="mt-1 text-3xl font-black tabular-nums text-[#10091b]">{value}</p>
      <p className="mt-1 text-xs text-[#8b8490]">{detail}</p>
    </Link>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: activeOrders },
    { data: paidOrders },
    { data: products },
    { count: clients },
    { data: pendingPayments },
    { count: pendingRetractions },
    { data: latestOrders },
  ] = await Promise.all([
    // Cancelados y entregados ya no requieren trabajo: no cuentan como activos.
    supabase.from("orders").select("id", { count: "exact", head: true }).not("status", "in", "(entregado,cancelado)"),
    supabase.from("orders").select("total").eq("payment_status", "pagado").gte("created_at", startOfMonth.toISOString()),
    supabase.from("products").select("active"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "cliente"),
    supabase
      .from("orders")
      .select("id, client_name, total, created_at")
      .eq("payment_status", "pendiente")
      .neq("status", "cancelado")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("retraction_requests").select("id", { count: "exact", head: true }).eq("status", "pendiente"),
    supabase
      .from("orders")
      .select("id, client_name, channel, status, total, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const billed = paidOrders?.reduce((sum, order) => sum + Number(order.total), 0) ?? 0;
  const progress = Math.min(100, Math.round((billed / monthlyGoal) * 100));
  const activos = products?.filter((product) => product.active).length ?? 0;
  const ocultos = (products?.length ?? 0) - activos;

  const alertas = [
    ...(pendingRetractions
      ? [
          {
            texto: `${pendingRetractions} solicitud${pendingRetractions === 1 ? "" : "es"} de arrepentimiento sin resolver`,
            href: "/admin/solicitudes",
            Icon: IconUndo,
          },
        ]
      : []),
    ...(ocultos
      ? [
          {
            texto: `${ocultos} producto${ocultos === 1 ? "" : "s"} oculto${ocultos === 1 ? "" : "s"} en la tienda`,
            href: "/admin/productos?estado=ocultos",
            Icon: IconBox,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a62ab]">Mesa de taller</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-[#10091b]">Dashboard</h1>
        </div>
        <p className="text-sm font-medium text-[#6b6472]">
          Actualizado {new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Facturación del mes"
          value={money(billed)}
          detail={`${progress}% de la meta de ${money(monthlyGoal)}`}
          href="/admin/finanzas"
          tone="bg-emerald-50 text-emerald-600"
          Icon={IconMoney}
        />
        <StatCard
          title="Pedidos activos"
          value={String(activeOrders ?? 0)}
          detail="Pendientes, en producción, listos o enviados"
          href="/admin/pedidos"
          tone="bg-sky-50 text-sky-600"
          Icon={IconBag}
        />
        <StatCard
          title="Productos en tienda"
          value={String(activos)}
          detail={ocultos ? `${ocultos} oculto${ocultos === 1 ? "" : "s"}` : "Todo el catálogo visible"}
          href="/admin/productos"
          tone="bg-amber-50 text-amber-600"
          Icon={IconBox}
        />
        <StatCard
          title="Clientes registrados"
          value={String(clients ?? 0)}
          detail="Cuentas creadas en la tienda"
          href="/admin/clientes"
          tone="bg-[#f1ebf6] text-[#6f2fa3]"
          Icon={IconUsers}
        />
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-[#441a66]/8 bg-white p-7 shadow-[0_10px_30px_rgba(16,9,27,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 text-xl font-black text-[#10091b]">
              <IconBell className="size-6 text-amber-500" /> Pagos pendientes
            </h2>
            {pendingPayments?.length ? (
              <span className="rounded-full bg-[#fdecec] px-3 py-1 text-xs font-bold text-[#c0392b]">
                {pendingPayments.length} pendiente{pendingPayments.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {pendingPayments?.length ? (
              pendingPayments.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/pedidos"
                  className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf8fc] p-4 transition hover:bg-[#f1ebf6]"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-white p-2 shadow-sm">
                      <IconBag className="size-5 text-[#6f2fa3]" />
                    </span>
                    <div>
                      <p className="font-bold">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-[#6b6472]">
                        {order.client_name} · {new Date(order.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                  <p className="font-black tabular-nums">{money(Number(order.total))}</p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl bg-[#faf8fc] p-8 text-center text-sm text-[#6b6472]">
                No hay pedidos esperando pago.
              </p>
            )}
          </div>

          {alertas.length ? (
            <div className="mt-6 flex flex-col gap-2 border-t border-[#441a66]/8 pt-5">
              {alertas.map(({ texto, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#6f2fa3] transition hover:bg-[#f1ebf6]"
                >
                  <Icon className="size-4" /> {texto}
                  <IconArrow className="ml-auto size-4" />
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl bg-[#10091b] p-7 text-white shadow-[0_18px_45px_rgba(16,9,27,0.25)]">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Acciones rápidas</h2>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#10091b] transition hover:bg-[#f1ebf6]"
            >
              <IconPlus className="size-4" /> Nuevo producto
            </Link>
            <Link
              href="/admin/pedidos"
              className="rounded-xl bg-[#6f2fa3] px-4 py-3.5 text-center text-sm font-bold transition hover:bg-[#8544b5]"
            >
              Cargar pedido
            </Link>
            <Link
              href="/admin/calculadora"
              className="rounded-xl bg-white/10 px-4 py-3.5 text-center text-sm font-bold transition hover:bg-white/15"
            >
              Calculadora de precios
            </Link>
            <Link
              href="/"
              target="_blank"
              className="mt-1 rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Ver tienda
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#441a66]/8 bg-white p-7 shadow-[0_10px_30px_rgba(16,9,27,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-[#10091b]">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm font-bold text-[#6f2fa3]">
            Ver todos →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-[#441a66]/8">
          {latestOrders?.length ? (
            latestOrders.map((order) => (
              <article key={order.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold">{order.client_name}</p>
                  <p className="text-sm text-[#6b6472]">
                    {order.channel} · {money(Number(order.total))}
                  </p>
                </div>
                <StatusPill status={order.status} />
                <StatusPill status={order.payment_status} />
              </article>
            ))
          ) : (
            <p className="py-8 text-sm text-[#6b6472]">Todavía no hay pedidos cargados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
