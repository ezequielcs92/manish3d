import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/admin/status-pill";
import { StoreHeader } from "@/components/tienda/store-header";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { money } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

const steps = ["pendiente", "produccion", "listo", "enviado", "entregado"];

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!hasSupabaseAdminEnv() && id === "demo-preview") {
    return (
      <main className="brand-grid min-h-screen bg-[#f8f8f8] text-[#10091b]">
        <StoreHeader />
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="glass-panel rounded-[3rem] border border-[#441a66]/10 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#8a62ab]">Seguimiento demo</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.05em]">Pedido #demo</h1>
            <p className="mt-3 text-[#545454]">Preview local sin Supabase configurado.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-5">
              {steps.map((step, index) => (
                <div key={step} className={`rounded-2xl border p-3 text-center text-xs font-bold uppercase tracking-[0.14em] ${index === 0 ? "border-[#441a66]/30 bg-[#441a66] text-white" : "border-[#441a66]/10 bg-white text-[#545454]"}`}>
                  {step}
                </div>
              ))}
            </div>
            <Link href="/" className="shine-hover mt-6 inline-flex rounded-full bg-[#441a66] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_rgba(68,26,102,0.25)]">
              Volver a la tienda
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const supabase = createAdminClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, client_name, status, total, payment_status, created_at")
      .eq("id", id)
      .single(),
    supabase
      .from("order_items")
      .select("id, quantity, unit_price")
      .eq("order_id", id),
  ]);

  if (!order) notFound();

  const activeStep = steps.includes(order.status) ? steps.indexOf(order.status) : 0;

  return (
    <main className="brand-grid min-h-screen bg-[#f8f8f8] text-[#10091b]">
      <StoreHeader />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="glass-panel rounded-[3rem] border border-[#441a66]/10 p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#8a62ab]">Seguimiento</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.05em]">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="mt-3 text-[#545454]">Cliente: {order.client_name}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <StatusPill status={order.status} />
            <StatusPill status={order.payment_status} />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step} className={`rounded-2xl border p-3 text-center text-xs font-bold uppercase tracking-[0.14em] ${index <= activeStep ? "border-[#441a66]/30 bg-[#441a66] text-white shadow-[0_14px_35px_rgba(68,26,102,0.22)]" : "border-[#441a66]/10 bg-white text-[#545454]"}`}>
                {step}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-[#441a66]/10 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Resumen</h2>
            <div className="mt-4 divide-y divide-[#441a66]/10">
              {items?.length ? (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span>{item.quantity} unidad(es)</span>
                    <span className="font-bold tabular-nums text-[#441a66]">{money(Number(item.unit_price) * Number(item.quantity))}</span>
                  </div>
                ))
              ) : (
                <p className="py-3 text-sm text-[#545454]">Sin items registrados.</p>
              )}
            </div>
            <p className="mt-5 border-t border-[#441a66]/10 pt-5 text-4xl font-black tabular-nums text-[#441a66]">
              {money(Number(order.total))}
            </p>
          </div>

          <Link href="/" className="shine-hover mt-6 inline-flex rounded-full bg-[#441a66] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_rgba(68,26,102,0.25)]">
            Volver a la tienda
          </Link>
        </div>
      </section>
    </main>
  );
}
